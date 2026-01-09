import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getDatabase } from "@/lib/mongodb";
import { getInvestorThesisByEmail } from "../investor/thesis/route";

export const dynamic = "force-dynamic";

// ------------------ Gmail Fetch Helper ------------------

async function fetchGmailJson(url, accessToken, context = "GMAIL") {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`❌ ${context} failed`, {
        url,
        status: res.status,
        statusText: res.statusText,
        body: text,
      });
      return { ok: false, data: null };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    console.error(`🔥 ${context} exception`, { url, error: err });
    return { ok: false, data: null };
  }
}

// ------------------ Enhanced Utils ------------------

function decodeBase64Safe(base64String) {
  if (!base64String) return "";
  try {
    const cleanBase64 = base64String
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .replace(/\s/g, "")
      .replace(/[^A-Za-z0-9+/=]/g, "");

    const paddedBase64 = cleanBase64.padEnd(
      cleanBase64.length + ((4 - (cleanBase64.length % 4)) % 4),
      "="
    );

    const buff = Buffer.from(paddedBase64, "base64");
    let decoded = buff.toString("utf-8");

    decoded = decoded
      .replace(/[^\x00-\x7F]/g, "")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .trim();

    return decoded;
  } catch (error) {
    console.warn("Base64 decoding failed:", error?.message);
    return "";
  }
}

function extractBodySafe(payload) {
  if (!payload) return "";

  try {
    // Direct body
    if (payload.body?.data) {
      const content = decodeBase64Safe(payload.body.data);
      if (content && content.trim().length > 0) return content;
    }

    // Multipart
    if (payload.parts?.length) {
      const htmlPart = payload.parts.find((p) => p.mimeType === "text/html");
      if (htmlPart?.body?.data) {
        const content = decodeBase64Safe(htmlPart.body.data);
        if (content && content.trim().length > 0) return content;
      }

      const textPart = payload.parts.find((p) => p.mimeType === "text/plain");
      if (textPart?.body?.data) {
        const content = decodeBase64Safe(textPart.body.data);
        if (content && content.trim().length > 0) return content;
      }

      // Nested parts
      for (const part of payload.parts) {
        const content = extractBodySafe(part);
        if (content && content.trim().length > 0) return content;
      }
    }
  } catch (error) {
    console.warn("Error extracting body:", error?.message);
  }

  return "";
}

function extractAttachmentsSafe(payload, messageId) {
  const attachments = [];

  try {
    function processPart(part) {
      if (
        part.filename &&
        part.filename.length > 0 &&
        part.body?.attachmentId
      ) {
        attachments.push({
          id: part.body.attachmentId,
          filename: part.filename.replace(/[^\x20-\x7E]/g, ""),
          mimeType: part.mimeType || "application/octet-stream",
          size: part.body.size || "Unknown size",
          url: `/api/gmail/attachments/${messageId}/${part.body.attachmentId}`,
        });
      }

      if (part.parts) {
        part.parts.forEach(processPart);
      }
    }

    if (payload?.parts) {
      payload.parts.forEach(processPart);
    }
  } catch (error) {
    console.warn("Error extracting attachments:", error?.message);
  }

  return attachments;
}

// ------------------ Text Cleaning ------------------

function cleanTextForMongoDB(text) {
  if (!text) return "";

  try {
    return text
      .toString()
      .replace(/[^\x20-\x7E\t\n\r]/g, "") // printable ASCII + whitespace
      .replace(/\x00/g, "") // null bytes
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 50000);
  } catch (error) {
    console.warn("Text cleaning failed:", error?.message);
    return "Content unavailable";
  }
}

function cleanEmailData(emailData) {
  return {
    gmailId: emailData.gmailId,
    from: cleanTextForMongoDB(emailData.from),
    fromEmail: cleanTextForMongoDB(emailData.fromEmail),
    subject: cleanTextForMongoDB(emailData.subject),
    content: cleanTextForMongoDB(emailData.content),
    sector: cleanTextForMongoDB(emailData.sector),
    status: cleanTextForMongoDB(emailData.status),
    relevanceScore: emailData.relevanceScore || 0,
    timestamp: emailData.timestamp,
    attachments: emailData.attachments || [],
    isRead: emailData.isRead ?? false,
    isStarred: emailData.isStarred ?? false,
    createdAt: emailData.createdAt || new Date(),
    links: emailData.links || [],

    // threading
    threadId: emailData.threadId || null,
    replies: emailData.replies || [],
  };
}

// ------------------ Sector Detection ------------------

const sectorKeywords = {
  Fintech: [
    "fintech",
    "bank",
    "finance",
    "loan",
    "credit",
    "insurance",
    "nbfc",
    "payment",
  ],
  Investor: ["vc", "venture", "fund", "capital", "angel", "investor"],
  Mobility: [
    "ev",
    "electric vehicle",
    "fleet",
    "mobility",
    "transport",
    "logistics",
  ],
  "AI / Tech": [
    "ai",
    "machine learning",
    "data",
    "automation",
    "software",
    "tech",
    "ai/ml",
  ],
  Healthcare: ["health", "medtech", "bio", "pharma", "care"],
  ECommerce: [
    "commerce",
    "retail",
    "shop",
    "marketplace",
    "ecommerce",
    "store",
  ],
  Startup: ["startup", "founder", "pitch", "seed", "bootstrap"],
};

function detectSector(from, subject, body) {
  try {
    const text = (from + subject + body).toLowerCase();

    for (const [sector, keywords] of Object.entries(sectorKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return sector;
      }
    }
  } catch (error) {
    console.warn("Sector detection failed:", error?.message);
  }

  return "General";
}

function determineStatus({ accepted, rejected, isRead }) {
  if (accepted && !rejected) return "Under Evaluation";
  if (rejected) return "Rejected";
  if (!isRead) return "New";
  return "Pending";
}

// ------------------ Relevance Scoring ------------------

function computeRelevance(email, thesis) {
  try {
    if (!thesis) return 0;

    const text = (email.subject + " " + email.content).toLowerCase();
    let score = 0;
    let maxScore = 0;

    // Sector
    maxScore += 30;
    if (
      thesis.sectors?.some((s) =>
        email.sector?.toLowerCase().includes(s.toLowerCase())
      )
    ) {
      score += 30;
    }

    // Keywords
    maxScore += 40;
    if (thesis.keywords?.length) {
      const keywordMatches = thesis.keywords.filter((kw) =>
        text.includes(kw.toLowerCase())
      ).length;
      score += Math.min(40, (keywordMatches / thesis.keywords.length) * 40);
    }

    // Excluded
    if (thesis.excludedKeywords?.length) {
      const excludedMatches = thesis.excludedKeywords.filter((kw) =>
        text.includes(kw.toLowerCase())
      ).length;
      score -= excludedMatches * 15;
    }

    // Geography
    maxScore += 20;
    if (thesis.geographies?.length) {
      const geoMatches = thesis.geographies.filter((g) =>
        text.includes(g.toLowerCase())
      ).length;
      score += Math.min(20, (geoMatches / thesis.geographies.length) * 20);
    }

    const relevance = Math.max(0, Math.min(100, (score / maxScore) * 100));
    return Math.round(relevance);
  } catch (error) {
    console.warn("Relevance computation failed:", error?.message);
    return 0;
  }
}

// ------------------ DB Helpers ------------------

async function getExistingEmailSafe(collection, gmailId) {
  try {
    const existing = await collection.findOne(
      { gmailId },
      {
        projection: {
          gmailId: 1,
          from: 1,
          fromEmail: 1,
          subject: 1,
          content: 1,
          sector: 1,
          status: 1,
          relevanceScore: 1,
          timestamp: 1,
          attachments: 1,
          isRead: 1,
          isStarred: 1,
          createdAt: 1,
          links: 1,
          threadId: 1,
          replies: 1,
        },
      }
    );

    if (existing) {
      return cleanEmailData(existing);
    }
  } catch (error) {
    console.warn(
      `Error fetching email ${gmailId} from database:`,
      error?.message
    );
    try {
      await collection.deleteOne({ gmailId });
    } catch (deleteError) {
      console.warn(
        `Failed to delete corrupted email ${gmailId}:`,
        deleteError?.message
      );
    }
  }
  return null;
}

function extractLinksFromText(text = "") {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s"'<>]+|www\.[^\s"'<>]+)/gi;
  return text.match(urlRegex) || [];
}

// ------------------ Thread Replies ------------------

// async function getThreadReplies(threadId, accessToken) {
//   if (!threadId) return [];

//   const url = `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`;
//   const { ok, data } = await fetchGmailJson(url, accessToken, "THREAD_DETAIL");

//   if (!ok || !data) return [];

//   try {
//     const messages = data.messages || [];
//     if (!messages.length) return [];

//     const originalId = messages[0].id;
//     const replies = [];

//     for (const msg of messages) {
//       if (msg.id === originalId) continue;

//       const headers = msg.payload?.headers || [];
//       const subject =
//         headers.find((h) => h.name === "Subject")?.value || "(no subject)";
//       const fromHeader =
//         headers.find((h) => h.name === "From")?.value || "(unknown sender)";
//       const date = headers.find((h) => h.name === "Date")?.value || "";

//       const content = extractBodySafe(msg.payload);

//       replies.push({
//         id: msg.id,
//         subject: cleanTextForMongoDB(subject),
//         from: cleanTextForMongoDB(fromHeader),
//         date,
//         content: cleanTextForMongoDB(content),
//       });
//     }

//     // newest reply first (so replies[0] is the latest)
//     replies.sort((a, b) => new Date(b.date) - new Date(a.date));
//     return replies;
//   } catch (error) {
//     console.warn("Error parsing thread replies:", error?.message);
//     return [];
//   }
// }

async function getThreadReplies(collection, messageId) {
  return collection
    .find({ inReplyTo: messageId })
    .sort({ receivedAt: -1 })
    .toArray();
}


// ------------------ Main Handler ------------------

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  }

  const tokenInfoRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${session.accessToken}`
  );
  const tokenInfo = await tokenInfoRes.json();

  console.log("🔍 TOKEN INFO", tokenInfo);

  try {
    const db = await getDatabase();
    const emailsCollection = db.collection("gmail_emails");
    const acceptedCollection = db.collection("accepted_pitches");
    const rejectedCollection = db.collection("rejected_pitches");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const thesis = await getInvestorThesisByEmail(session.user.email);

    const query =
      "newer_than:90d (startup OR pitch OR investor OR fund OR vc OR fintech OR founder OR deck)";

    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
      query
    )}`;
    const { ok: listOk, data: listData } = await fetchGmailJson(
      listUrl,
      session.accessToken,
      "MESSAGE_LIST"
    );

    if (!listOk || !listData) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch Gmail list",
        }),
        { status: 502 }
      );
    }

    const allMessages = listData.messages || [];
    const paginatedMessages = allMessages.slice(offset, offset + limit);
    const gmailIds = paginatedMessages.map((m) => m.id);

    // Accepted / Rejected lookup
    const [accepted, rejected] = await Promise.all([
      acceptedCollection
        .find({ userEmail: session.user.email, emailId: { $in: gmailIds } })
        .toArray(),
      rejectedCollection
        .find({ userEmail: session.user.email, emailId: { $in: gmailIds } })
        .toArray(),
    ]);

    const acceptedIds = new Set(accepted.map((a) => a.emailId));
    const rejectedIds = new Set(rejected.map((r) => r.emailId));

    const emailPromises = paginatedMessages.map(async (msg) => {
      // 1. Try DB cache
      let existing = await getExistingEmailSafe(emailsCollection, msg.id);

      // If existing but without threadId (old data), force refetch to enable replies
      if (existing && !existing.threadId) {
        existing = null;
      }

      if (existing) {
        // refresh accepted/rejected flags & status
        existing.accepted = acceptedIds.has(existing.gmailId);
        existing.rejected = rejectedIds.has(existing.gmailId);
        existing.status = determineStatus({
          accepted: existing.accepted,
          rejected: existing.rejected,
          isRead: existing.isRead,
        });

        // refresh links and replies (get latest replies)
        existing.links = extractLinksFromText(existing.content || "");
        existing.replies = await getThreadReplies(
          existing.threadId,
          session.accessToken
        );

        // update timestamp to latest reply date if present
        try {
          let finalTimestamp = existing.timestamp
            ? new Date(existing.timestamp)
            : new Date();

          if (existing.replies && existing.replies.length > 0) {
            const latestReplyDate = new Date(existing.replies[0].date);
            if (!isNaN(latestReplyDate.getTime())) {
              finalTimestamp = latestReplyDate;
            }
          }

          existing.timestamp = finalTimestamp.toISOString();
        } catch (err) {
          // keep existing.timestamp as-is if parse fails
        }

        return existing;
      }

      // 2. Fetch fresh from Gmail
      const messageUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`;
      const { ok: msgOk, data: detail } = await fetchGmailJson(
        messageUrl,
        session.accessToken,
        "MESSAGE_DETAIL"
      );

      if (!msgOk || !detail) return null;

      const headers = detail.payload?.headers || [];
      const subject =
        headers.find((h) => h.name === "Subject")?.value || "(no subject)";
      const fromHeader =
        headers.find((h) => h.name === "From")?.value || "(unknown sender)";
      const date = headers.find((h) => h.name === "Date")?.value || "";

      const rawBody = extractBodySafe(detail.payload);
      const attachments = extractAttachmentsSafe(detail.payload, msg.id);

      let from = cleanTextForMongoDB(fromHeader);
      let fromEmail = cleanTextForMongoDB(fromHeader);
      const match = fromHeader.match(/^(.*)<(.+)>$/);
      if (match) {
        from = cleanTextForMongoDB(match[1].trim());
        fromEmail = cleanTextForMongoDB(match[2].trim());
      }

      const cleanedSubject = cleanTextForMongoDB(subject);
      const cleanedBody = cleanTextForMongoDB(rawBody);
      const sector = detectSector(fromEmail, cleanedSubject, cleanedBody);
      const isRead = !detail.labelIds?.includes("UNREAD");
      const isStarred = detail.labelIds?.includes("STARRED") || false;

      const status = determineStatus({
        accepted: acceptedIds.has(msg.id),
        rejected: rejectedIds.has(msg.id),
        isRead,
      });

      const relevanceScore = computeRelevance(
        { subject: cleanedSubject, content: cleanedBody, sector },
        thesis
      );

      const threadId = detail.threadId || null;
      const links = extractLinksFromText(cleanedBody);
      const replies = await getThreadReplies(threadId, session.accessToken);

      // compute final timestamp: prefer latest reply date if exists
      let finalTimestamp = date ? new Date(date) : new Date();
      if (replies && replies.length > 0) {
        const latestReplyDate = new Date(replies[0].date);
        if (!isNaN(latestReplyDate.getTime())) {
          finalTimestamp = latestReplyDate;
        }
      }

      const newEmail = cleanEmailData({
        gmailId: msg.id,
        from,
        fromEmail,
        subject: cleanedSubject,
        sector,
        status,
        relevanceScore,
        timestamp: finalTimestamp.toISOString(),
        content: cleanedBody,
        attachments,
        isRead,
        isStarred,
        createdAt: new Date(),
        links,
        threadId,
        replies,
      });

      return newEmail;
    });

    const emailResults = await Promise.allSettled(emailPromises);

    // Bulk upsert into DB
    const bulkOps = emailResults
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => ({
        updateOne: {
          filter: { gmailId: r.value.gmailId },
          update: { $set: r.value },
          upsert: true,
        },
      }));

    if (bulkOps.length > 0) {
      try {
        await emailsCollection.bulkWrite(bulkOps, { ordered: false });
      } catch (error) {
        console.warn("Bulk write error:", error?.message);
      }
    }

    // Build final sanitized list from results (use returned values, not DB, to reflect latest computed timestamp)
    const cleanedEmails = emailResults
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => r.value)
      .filter(Boolean);

    // Sort by timestamp (newest first) so replied threads with updated timestamp come first
    cleanedEmails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Map to response shape: remove internal fields
    const sanitized = cleanedEmails.map((e) => {
      const clone = { ...e };
      return {
        ...clone,
        id: clone.gmailId,
        // hide internal DB id fields if present
        _id: undefined,
        gmailId: undefined,
      };
    });

    return new Response(
      JSON.stringify({
        emails: sanitized,
        total: allMessages.length,
        page,
        limit,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }
    );
  } catch (err) {
    console.error("🔥 Gmail API error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: "Failed to process email data",
      }),
      { status: 500 }
    );
  }
}

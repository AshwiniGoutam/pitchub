import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getDatabase } from "@/lib/mongodb";
import { getInvestorThesisByEmail } from "../investor/thesis/route";

export const dynamic = "force-dynamic";

// ------------------ Enhanced Utils ------------------

function decodeBase64Safe(base64String) {
  if (!base64String) return "";
  try {
    // Clean the base64 string
    const cleanBase64 = base64String
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .replace(/\s/g, "")
      .replace(/[^A-Za-z0-9+/=]/g, "");

    // Ensure the string length is a multiple of 4
    const paddedBase64 = cleanBase64.padEnd(
      cleanBase64.length + ((4 - (cleanBase64.length % 4)) % 4),
      "="
    );

    const buff = Buffer.from(paddedBase64, "base64");

    // Convert to string with proper error handling
    let decoded = buff.toString("utf-8");

    // Remove any remaining invalid UTF-8 sequences
    decoded = decoded
      .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
      .trim();

    return decoded;
  } catch (error) {
    console.warn(
      "Base64 decoding failed, returning empty string:",
      error.message
    );
    return "";
  }
}

function extractBodySafe(payload) {
  if (!payload) return "";

  try {
    // Try to get data from body first
    if (payload.body?.data) {
      const content = decodeBase64Safe(payload.body.data);
      if (content && content.trim().length > 0) return content;
    }

    // Recursively search through parts
    if (payload.parts?.length) {
      // Prefer HTML over plain text
      const htmlPart = payload.parts.find((p) => p.mimeType === "text/html");
      if (htmlPart?.body?.data) {
        const content = decodeBase64Safe(htmlPart.body.data);
        if (content && content.trim().length > 0) return content;
      }

      // Fall back to plain text
      const textPart = payload.parts.find((p) => p.mimeType === "text/plain");
      if (textPart?.body?.data) {
        const content = decodeBase64Safe(textPart.body.data);
        if (content && content.trim().length > 0) return content;
      }

      // Recursively check nested parts
      for (const part of payload.parts) {
        const content = extractBodySafe(part);
        if (content && content.trim().length > 0) return content;
      }
    }
  } catch (error) {
    console.warn("Error extracting body:", error.message);
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
          filename: part.filename.replace(/[^\x20-\x7E]/g, ""), // Clean filename
          mimeType: part.mimeType || "application/octet-stream",
          size: part.body.size || "Unknown size",
          url: `/api/gmail/attachments/${messageId}/${part.body.attachmentId}`,
        });
      }

      if (part.parts) {
        part.parts.forEach(processPart);
      }
    }

    if (payload.parts) {
      payload.parts.forEach(processPart);
    }
  } catch (error) {
    console.warn("Error extracting attachments:", error.message);
  }

  return attachments;
}

// ------------------ Text Cleaning ------------------

function cleanTextForMongoDB(text) {
  if (!text) return "";

  try {
    return text
      .toString()
      .replace(/[^\x20-\x7E\t\n\r]/g, "") // Keep only printable ASCII + whitespace
      .replace(/\x00/g, "") // Remove null bytes
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
      .substring(0, 50000); // Limit length
  } catch (error) {
    console.warn("Text cleaning failed:", error.message);
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
    isRead: emailData.isRead || false,
    isStarred: emailData.isStarred || false,
    createdAt: emailData.createdAt || new Date(),
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
    console.warn("Sector detection failed:", error.message);
  }

  return "General";
}

function defaultStatus(sector) {
  if (sector === "Investor") return "Under Evaluation";
  if (sector === "Fintech") return "New";
  if (sector === "Startup") return "Contacted";
  return "Pending";
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
    const text = (email.subject + " " + email.content).toLowerCase();
    let score = 0;
    let maxScore = 0;

    // 🎯 Sector match
    maxScore += 30;
    if (
      thesis.sectors?.some((s) =>
        email.sector?.toLowerCase().includes(s.toLowerCase())
      )
    ) {
      score += 30;
    }

    // 🔑 Keyword match
    maxScore += 40;
    if (thesis.keywords?.length) {
      const keywordMatches = thesis.keywords.filter((kw) =>
        text.includes(kw.toLowerCase())
      ).length;
      score += Math.min(40, (keywordMatches / thesis.keywords.length) * 40);
    }

    // 🚫 Excluded keyword penalty
    if (thesis.excludedKeywords?.length) {
      const excludedMatches = thesis.excludedKeywords.filter((kw) =>
        text.includes(kw.toLowerCase())
      ).length;
      score -= excludedMatches * 15;
    }

    // 🌍 Geography match
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
    console.warn("Relevance computation failed:", error.message);
    return 0;
  }
}

// ------------------ Database Operations ------------------

async function getExistingEmailSafe(collection, gmailId) {
  try {
    // Use projection to limit fields and avoid BSON parsing issues
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
        },
      }
    );

    if (existing) {
      return cleanEmailData(existing);
    }
  } catch (error) {
    console.warn(
      `Error fetching email ${gmailId} from database:`,
      error.message
    );
    // If there's corrupted data, delete it so it can be recreated
    try {
      await collection.deleteOne({ gmailId });
    } catch (deleteError) {
      console.warn(
        `Failed to delete corrupted email ${gmailId}:`,
        deleteError.message
      );
    }
  }
  return null;
}

// ------------------ Main Handler ------------------

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  }

  try {
    const db = await getDatabase();
    const emailsCollection = db.collection("gmail_emails");
    const acceptedCollection = db.collection("accepted_pitches");
    const rejectedCollection = db.collection("rejected_pitches");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // 1️⃣ Fetch investor thesis
    const thesis = await getInvestorThesisByEmail(session.user.email);

    // 2️⃣ Fetch Gmail list
    const query =
      "newer_than:90d (startup OR pitch OR investor OR fund OR vc OR fintech OR founder OR deck)";
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
        query
      )}`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );

    if (!listRes.ok) {
      const errorText = await listRes.text();
      return new Response(
        JSON.stringify({
          error: "Failed to fetch Gmail list",
          details: errorText,
        }),
        { status: 502 }
      );
    }

    const listData = await listRes.json();
    const allMessages = listData.messages || [];
    const paginatedMessages = allMessages.slice(offset, offset + limit);
    const gmailIds = paginatedMessages.map((m) => m.id);

    // 3️⃣ Fetch accepted and rejected emails in parallel
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

    // 4️⃣ Fetch email details in parallel
    const emailPromises = paginatedMessages.map(async (msg) => {
      let existing = await getExistingEmailSafe(emailsCollection, msg.id);
      if (existing) {
        existing.accepted = acceptedIds.has(existing.gmailId);
        existing.rejected = rejectedIds.has(existing.gmailId);

        existing.status = determineStatus({
          accepted: existing.accepted,
          rejected: existing.rejected,
          isRead: existing.isRead,
        });
        return existing;
      }

      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      );
      if (!detailRes.ok) return null;

      const detail = await detailRes.json();
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
      const status = determineStatus({
        accepted: acceptedIds.has(msg.id),
        rejected: rejectedIds.has(msg.id),
        isRead: !detail.labelIds?.includes("UNREAD"),
      });

      const relevanceScore = computeRelevance(
        { subject: cleanedSubject, content: cleanedBody, sector },
        thesis
      );

      const newEmail = cleanEmailData({
        gmailId: msg.id,
        from,
        fromEmail,
        subject: cleanedSubject,
        sector,
        status,
        relevanceScore,
        timestamp: new Date(date).toISOString(),
        content: cleanedBody,
        attachments,
        isRead: !detail.labelIds?.includes("UNREAD"),
        isStarred: detail.labelIds?.includes("STARRED") || false,
        createdAt: new Date(),
        accepted: acceptedIds.has(msg.id),
        rejected: rejectedIds.has(msg.id),
      });

      return newEmail;
    });

    const emailResults = await Promise.allSettled(emailPromises);

    // 5️⃣ Prepare bulk DB writes
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
      await emailsCollection.bulkWrite(bulkOps);
    }

    // 6️⃣ Sort by relevance and sanitize
    const sanitized = emailResults
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => {
        const e = r.value;
        return {
          ...e,
          id: e.gmailId,
          _id: undefined,
          gmailId: undefined,
        };
      })
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

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

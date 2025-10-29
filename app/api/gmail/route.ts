import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getDatabase } from "@/lib/mongodb";

// ------------------ Utils ------------------

function decodeBase64(base64String) {
  if (!base64String) return "";
  const buff = Buffer.from(
    base64String.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  );
  return buff.toString("utf-8");
}

function extractBody(payload) {
  if (!payload) return "";
  if (payload.body?.data) return decodeBase64(payload.body.data);

  if (payload.parts?.length) {
    const htmlPart = payload.parts.find((p) => p.mimeType === "text/html");
    if (htmlPart?.body?.data) return decodeBase64(htmlPart.body.data);

    const textPart = payload.parts.find(
      (p) => p.mimeType === "text/plain"
    );
    if (textPart?.body?.data) return decodeBase64(textPart.body.data);

    for (const part of payload.parts) {
      const content = extractBody(part);
      if (content) return content;
    }
  }
  return "";
}

// Function to extract attachments
function extractAttachments(payload, messageId) {
  const attachments = [];

  function processPart(part, path = '') {
    if (part.filename && part.filename.length > 0 && part.body?.attachmentId) {
      attachments.push({
        id: part.body.attachmentId,
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.body.size || 'Unknown size',
        url: `/api/gmail/attachments/${messageId}/${part.body.attachmentId}`
      });
    }

    if (part.parts) {
      part.parts.forEach((p, index) => processPart(p, `${path}.parts[${index}]`));
    }
  }

  if (payload.parts) {
    payload.parts.forEach((part, index) => processPart(part, `parts[${index}]`));
  }

  return attachments;
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
  const text = (from + subject + body).toLowerCase();

  for (const [sector, keywords] of Object.entries(sectorKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return sector;
    }
  }

  return "General";
}

function defaultStatus(sector) {
  if (sector === "Investor") return "Under Evaluation";
  if (sector === "Fintech") return "New";
  if (sector === "Startup") return "Contacted";
  return "Pending";
}

// ------------------ Relevance Scoring ------------------

function computeRelevance(email, thesis) {
  const text = (email.subject + " " + email.content).toLowerCase();
  let score = 0;
  let maxScore = 0;

  // 🎯 Sector match
  maxScore += 30;
  if (
    thesis.sectors?.some((s) =>
      email.sector.toLowerCase().includes(s.toLowerCase())
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
}

// ------------------ Main Handler ------------------

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  }

  try {
    const db = await getDatabase();
    const emailsCollection = db.collection("gmail_emails");
    const acceptedCollection = db.collection("accepted_pitches");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Step 1: Fetch investor thesis
    let thesis = { sectors: [], keywords: [], excludedKeywords: [], geographies: [] };
    try {
      const thesisRes = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/investor/thesis`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (thesisRes.ok) thesis = await thesisRes.json();
    } catch (err) {
      console.warn("⚠️ Thesis fetch failed, using default:", err);
    }

    // Step 2: Fetch Gmail messages (90 days)
    const query = "newer_than:90d (startup OR pitch OR investor OR fund OR vc OR fintech OR founder OR deck)";
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );

    if (!listRes.ok) {
      const text = await listRes.text();
      console.error("Gmail list fetch error:", text);
      return new Response(JSON.stringify({ error: "Failed to fetch Gmail list" }), { status: 502 });
    }

    const listData = await listRes.json();
    const allMessages = listData.messages || [];

    const paginatedMessages = allMessages.slice(offset, offset + limit);
    const gmailIds = paginatedMessages.map((m) => m.id);

    // ✅ Get accepted emails for this user in one query
    const accepted = await acceptedCollection
      .find({ userEmail: session.user.email, emailId: { $in: gmailIds } })
      .toArray();
    const acceptedIds = new Set(accepted.map((a) => a.emailId));

    const processedEmails = [];

    for (const msg of paginatedMessages) {
      let existing = await emailsCollection.findOne({ gmailId: msg.id });

      if (!existing) {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          { headers: { Authorization: `Bearer ${session.accessToken}` } }
        );
        if (!detailRes.ok) continue;

        const detail = await detailRes.json();
        const headers = detail.payload?.headers || [];
        const subject = headers.find((h) => h.name === "Subject")?.value || "(no subject)";
        const fromHeader = headers.find((h) => h.name === "From")?.value || "(unknown sender)";
        const date = headers.find((h) => h.name === "Date")?.value || "";
        const body = extractBody(detail.payload);
        const attachments = extractAttachments(detail.payload, msg.id);

        let from = fromHeader;
        let fromEmail = fromHeader;
        const match = fromHeader.match(/^(.*)<(.+)>$/);
        if (match) {
          from = match[1].trim();
          fromEmail = match[2].trim();
        }

        const sector = detectSector(fromEmail, subject, body);
        const status = defaultStatus(sector);
        const relevanceScore = computeRelevance({ subject, content: body, sector }, thesis);

        existing = {
          gmailId: msg.id,
          from,
          fromEmail,
          subject,
          sector,
          status,
          relevanceScore,
          timestamp: new Date(date).toISOString(),
          content: body,
          attachments,
          isRead: !detail.labelIds?.includes("UNREAD"),
          isStarred: detail.labelIds?.includes("STARRED") || false,
          createdAt: new Date(),
        };

        await emailsCollection.updateOne(
          { gmailId: msg.id },
          { $set: existing },
          { upsert: true }
        );
      }

      // ✅ mark accepted
      existing.accepted = acceptedIds.has(existing.gmailId);

      processedEmails.push(existing);
    }

    // Step 5: Sort by relevance
    const sorted = processedEmails.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // return new Response(
    //   JSON.stringify({ emails: sorted, total: allMessages.length, page, limit }),
    //   { status: 200 }
    // );
    // remove _id and rename gmailId -> id for frontend clarity
    const sanitized = sorted.map(e => ({
      ...e,
      id: e.gmailId,   // ✅ React will use this
      _id: undefined,  // ❌ hide Mongo _id
      gmailId: undefined
    }));

    return new Response(
      JSON.stringify({ emails: sanitized, total: allMessages.length, page, limit }),
      { status: 200 }
    );

  } catch (err) {
    console.error("🔥 Gmail API error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), { status: 500 });
  }
}
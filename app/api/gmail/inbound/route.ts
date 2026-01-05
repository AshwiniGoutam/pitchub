import { getDatabase } from "@/lib/mongodb";

function extractEmail(raw = "") {
  const match = raw.match(/<(.+?)>/);
  return match ? match[1].toLowerCase() : raw.toLowerCase();
}

export async function POST(req: Request) {
  const formData = await req.formData();

  const to = extractEmail(formData.get("to")?.toString() || "");
  const ownerEmail = to.replace("@inbound.pitchub.in", "");

  const db = await getDatabase();
  const emails = db.collection("emails");

  await emails.insertOne({
    ownerEmail, // 🔑 REQUIRED
    from: formData.get("from"),
    to,
    subject: formData.get("subject"),
    content: formData.get("body-plain") || formData.get("body-html"),
    messageId: formData.get("Message-Id"),
    inReplyTo: formData.get("In-Reply-To"),
    receivedAt: new Date(),
    createdAt: new Date(),
  });

  return Response.json({ success: true });
}

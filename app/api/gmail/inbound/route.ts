import { getDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  const formData = await req.formData();

  const db = await getDatabase();
  const emails = db.collection("emails");

  const email = {
    messageId: formData.get("message-id"),
    inReplyTo: formData.get("in-reply-to"),
    from: formData.get("from"),
    to: formData.get("to"),
    subject: formData.get("subject"),
    text: formData.get("text"),
    html: formData.get("html"),
    receivedAt: new Date(),
    attachments: [],
  };

  // Attachments
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("attachment")) {
      email.attachments.push({
        filename: value.name,
        type: value.type,
        size: value.size,
      });
    }
  }

  await emails.insertOne(email);

  return Response.json({ success: true });
}

import { getDatabase } from "@/lib/mongodb";

function extractEmail(str = "") {
  const match = str.match(/<(.+?)>/);
  return match ? match[1] : str;
}

export async function POST(req: Request) {
  const formData = await req.formData();

  const toRaw = formData.get("to")?.toString() || "";
  const toEmail = extractEmail(toRaw).toLowerCase();

  // 🔑 OWNER email (the user who forwarded)
  const ownerEmail = toEmail.replace(
    /@inbound\.pitchub\.in$/,
    "@gmail.com" // adapt if needed
  );

  const db = await getDatabase();
  const emails = db.collection("emails");

  await emails.insertOne({
    ownerEmail, // ✅ THIS FIXES EVERYTHING
    from: formData.get("from"),
    subject: formData.get("subject"),
    text: formData.get("body-plain"),
    html: formData.get("body-html"),
    messageId: formData.get("Message-Id"),
    inReplyTo: formData.get("In-Reply-To"),
    receivedAt: new Date(),
  });

  return Response.json({ success: true });
}

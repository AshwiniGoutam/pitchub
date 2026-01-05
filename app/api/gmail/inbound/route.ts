import { getDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  console.log("📩 Mailgun webhook hit");

  const formData = await req.formData();

  console.log("📨 Keys:", Array.from(formData.keys()));

  const db = await getDatabase();
  const emails = db.collection("emails");

  await emails.insertOne({
    from: formData.get("from"),
    to: formData.get("to"),
    subject: formData.get("subject"),
    text: formData.get("body-plain"),
    html: formData.get("body-html"),
    receivedAt: new Date(),
  });

  return Response.json({ ok: true });
}

import { getDatabase } from "@/lib/mongodb";

/**
 * GET → Just to verify endpoint is alive (browser / health check)
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      status: "ok",
      message: "Email inbound endpoint is live",
    }),
    { status: 200 }
  );
}

/**
 * POST → Mailgun will call this
 */
export async function POST(req: Request) {
  console.log("📩 Mailgun webhook hit");

  const formData = await req.formData();
  console.log("📨 Fields:", Array.from(formData.keys()));

  const db = await getDatabase();
  const emails = db.collection("emails");

  await emails.insertOne({
    from: formData.get("from"),
    to: formData.get("to"),
    subject: formData.get("subject"),
    text: formData.get("body-plain"),
    html: formData.get("body-html"),
    messageId: formData.get("Message-Id"),
    inReplyTo: formData.get("In-Reply-To"),
    receivedAt: new Date(),
  });

  return Response.json({ success: true });
}

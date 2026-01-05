export async function POST(req: Request) {
  console.log("📩 INBOUND EMAIL HIT");

  const formData = await req.formData();

  console.log(
    "📨 Fields:",
    Array.from(formData.keys())
  );

  return Response.json({ ok: true });
}

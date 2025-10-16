import { supabaseServer } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseServer.storage
      .from("pitch-decks")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    // Public URL
    const publicUrl = supabaseServer.storage
      .from("pitchub")
      .getPublicUrl(fileName).data.publicUrl;

    return new Response(JSON.stringify({ url: publicUrl }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

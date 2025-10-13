import { htmlToText } from "html-to-text";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { content } = body;

    if (!content || typeof content !== "string") {
      return new Response(JSON.stringify({ error: "No content provided" }), {
        status: 400,
      });
    }

    // Convert HTML email content to plain text
    const textContent = htmlToText(content, {
      wordwrap: 130,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' },
      ],
    });

    // Extractive summarization: first 3 sentences
    const sentences = textContent.split(/(?<=[.?!])\s+/).filter(Boolean);
    const summary = sentences.slice(0, 3).join(" ");

    return new Response(
      JSON.stringify({ summary: summary || "No summary available." }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("API error:", err);
    return new Response(
      JSON.stringify({ summary: "Failed to generate summary.", details: err.message }),
      { status: 500 }
    );
  }
}

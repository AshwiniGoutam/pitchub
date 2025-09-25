import { NextResponse } from "next/server";

export const runtime = "nodejs"; // use Node runtime for fetch

export async function GET(req) {
    try {
        const apiKey = process.env.NEWSAPI_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "API key not set in environment variables" },
                { status: 500 }
            );
        }

        // Keywords for filtering
        const keywords = [
            "startup",
            "investment",
            "funding",
            "pitch",
            "venture capital",
            "seed round",
            "series a",
            "series b",
            "investor"
        ];

        const query = keywords.join(" OR ");

        // Fetch articles from NewsAPI
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
            query
        )}&language=en&sortBy=publishedAt&ppageSize=100&page=1&apiKey=${process.env.NEWSAPI_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== "ok") {
            return NextResponse.json({ error: data.message || "Failed to fetch" }, { status: 500 });
        }

        // Filter to include only articles with keywords in title/description
        const filtered = data.articles
            .filter(
                (article) =>
                    keywords.some(
                        (k) =>
                            (article.title || "").toLowerCase().includes(k.toLowerCase()) ||
                            (article.description || "").toLowerCase().includes(k.toLowerCase())
                    )
            )
            .map((article) => ({
                title: article.title,
                description: article.description,
                url: article.url,
                source: article.source.name,
                publishedAt: article.publishedAt,
                image: article.urlToImage || "https://placehold.co/600x400?text=News",
            }));

        return NextResponse.json(filtered);
    } catch (error) {
        console.error("NewsAPI error:", error);
        return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
    }
}

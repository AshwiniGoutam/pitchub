// /app/api/email/detect-sector/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function detectSectorGemini(from: string, subject: string, body: string) {
  const text = `${subject}\n\n${body}\n\nFrom: ${from}`;

  const prompt = `
You are an assistant that classifies business emails into sectors.
Based on the content below, identify the most likely sector or industry.

Common sectors: Fintech, Mobility, AI / Tech, Healthcare, EdTech, SaaS, E-commerce, Energy, Logistics, Agriculture, Media, Gaming, Real Estate, Travel, Manufacturing, FoodTech, General.

Reply with ONLY the sector name.

Email:
"""${text}"""
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text().trim() || "General";
  } catch (err) {
    console.error("Gemini API error:", err);
    return "General"; // fallback if API fails
  }
}

export async function POST(request: NextRequest) {
  try {
    const { from, subject, body } = await request.json();

    if (!from || !subject || !body) {
      return NextResponse.json(
        { error: "Missing from, subject, or body in request" },
        { status: 400 }
      );
    }

    const sector = await detectSectorGemini(from, subject, body);

    return NextResponse.json({ sector });
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

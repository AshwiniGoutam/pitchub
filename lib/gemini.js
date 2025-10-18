import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function summarizeEmail(emailContent) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash"
    });

    const prompt = `
    Analyze the following email from a founder to an investor and provide a structured summary focused on investment evaluation.

    EMAIL CONTENT:
    ${emailContent}

    Provide your response in this exact JSON format only, no additional text:
    {
      "summary": "Brief 2-3 sentence executive summary of the pitch",
      "sector": "Primary industry sector (e.g., SaaS, FinTech, Healthcare, E-commerce, AI/ML)",
      "competitiveAnalysis": [
        "Main competitive advantage",
        "Key differentiation factor", 
        "Potential market challenge"
      ],
      "marketResearch": "Brief 1-2 sentence market overview with key growth metric",
      "fundingMentioned": true/false,
      "growthStage": "Early/Expansion/Mature"
    }

    Keep it very concise:
    - Competitive Analysis: Only 3 key points max
    - Market Research: 1-2 sentences only
    - Focus on most critical insights for investors
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response and parse JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      
      // Fallback response
      return {
        summary: "Analysis in progress...",
        sector: "Unknown",
        competitiveAnalysis: ["Strong market position", "Innovative technology", "Growing competition"],
        marketResearch: "Market showing strong growth potential with increasing demand.",
        fundingMentioned: false,
        growthStage: "Early"
      };
    }
  } catch (error) {
    console.error('Error summarizing email:', error);
    throw new Error('Failed to summarize email: ' + error.message);
  }
}
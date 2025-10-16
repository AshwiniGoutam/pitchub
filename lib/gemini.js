import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function summarizeEmail(emailContent) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash"
    });

    const prompt = `
    Analyze the following email from a founder to an investor and provide a comprehensive structured summary.

    EMAIL CONTENT:
    ${emailContent}

    Provide your response in this exact JSON format only, no additional text:
    {
      "summary": "Brief 2-3 sentence executive summary",
      "sector": "Primary industry sector (e.g., SaaS, FinTech, Healthcare, E-commerce, AI/ML, EdTech, CleanTech, Biotech, Consumer, Enterprise)",
      "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
      "urgency": "High/Medium/Low",
      "actionItems": ["action 1", "action 2", "action 3"],
      "sentiment": "Positive/Neutral/Negative",
      "fundingMentioned": true/false,
      "metricsMentioned": true/false,
      "growthStage": "Early/Expansion/Mature",
      "riskLevel": "High/Medium/Low",
      "competitivePosition": "Leading/Emerging/Challenger"
    }

    Additional Analysis Guidelines:
    - Growth Stage: Early (pre-product/market fit), Expansion (scaling), Mature (established)
    - Risk Level: Based on challenges, competition, market conditions
    - Competitive Position: Leading (market leader), Emerging (growing presence), Challenger (entering established market)
    - Focus on investor-relevant insights: traction, scalability, defensibility
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
      
      // Fallback response with default AI insights
      return {
        summary: "Unable to parse full analysis. Please try again.",
        sector: "Unknown",
        keyPoints: ["Analysis incomplete"],
        urgency: "Medium",
        actionItems: ["Review email manually"],
        sentiment: "Neutral",
        fundingMentioned: false,
        metricsMentioned: false,
        growthStage: "Early",
        riskLevel: "Medium",
        competitivePosition: "Emerging"
      };
    }
  } catch (error) {
    console.error('Error summarizing email:', error);
    throw new Error('Failed to summarize email: ' + error.message);
  }
}
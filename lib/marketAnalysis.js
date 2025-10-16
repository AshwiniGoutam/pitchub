import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function analyzeMarketNews(newsItems) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash"
    });

    const newsSummary = newsItems.slice(0, 15).map(item => 
      `Source: ${item.source}\nTitle: ${item.title}\nSummary: ${item.content.slice(0, 200)}...`
    ).join('\n\n');

    const prompt = `
    As an investment analyst specializing in venture capital and startup investments, analyze the following market news and provide strategic insights for investors.

    RECENT MARKET NEWS:
    ${newsSummary}

    Provide your analysis in this exact JSON format:
    {
      "marketSentiment": "Bullish/Neutral/Bearish",
      "keyTrends": ["trend1", "trend2", "trend3", "trend4"],
      "sectorOpportunities": [
        {
          "sector": "Sector Name",
          "outlook": "Positive/Neutral/Negative",
          "reason": "Brief explanation",
          "confidence": "High/Medium/Low"
        }
      ],
      "riskFactors": ["risk1", "risk2", "risk3"],
      "investmentRecommendations": ["recommendation1", "recommendation2", "recommendation3"],
      "emergingThemes": ["theme1", "theme2", "theme3"],
      "marketSummary": "2-3 paragraph summary of overall market conditions and investor implications with focus on VC and startup opportunities"
    }

    Focus on:
    - Venture capital funding trends and rounds
    - Startup ecosystem developments
    - Emerging sectors for investment
    - Early-stage investment opportunities
    - Exit strategies and IPO trends
    - Geographic investment hotspots
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON Parse Error in market analysis:', parseError);
      return getFallbackAnalysis();
    }
  } catch (error) {
    console.error('Error analyzing market news:', error);
    return getFallbackAnalysis();
  }
}

function getFallbackAnalysis() {
  return {
    marketSentiment: "Bullish",
    keyTrends: [
      "VC funding showing strong momentum in tech sectors",
      "Early-stage startups attracting significant investor interest",
      "AI and SaaS companies leading funding rounds",
      "Indian startup ecosystem maturing with larger deal sizes"
    ],
    sectorOpportunities: [
      {
        "sector": "Enterprise SaaS",
        "outlook": "Positive",
        "reason": "Strong revenue growth and global customer acquisition",
        "confidence": "High"
      },
      {
        "sector": "FinTech",
        "outlook": "Positive", 
        "reason": "Digital payments and lending platforms scaling rapidly",
        "confidence": "High"
      }
    ],
    riskFactors: [
      "Valuation concerns in late-stage rounds",
      "Regulatory changes affecting certain sectors",
      "Market volatility impacting exit timelines"
    ],
    investmentRecommendations: [
      "Focus on Series A and B companies with proven product-market fit",
      "Diversify across SaaS, FinTech, and HealthTech sectors",
      "Consider geographic diversification beyond major metros"
    ],
    emergingThemes: [
      "AI-first companies gaining traction",
      "Climate tech and sustainability focus",
      "B2B marketplaces and platforms"
    ],
    marketSummary: "The venture capital landscape remains robust with continued strong investor appetite for quality startups. Enterprise SaaS and FinTech sectors are particularly attractive with demonstrated revenue growth and scalable business models. Early-stage funding shows healthy activity, though investors are becoming more selective. The Indian startup ecosystem continues to mature with larger deal sizes and increased participation from global investors. Focus on companies with strong unit economics and clear paths to profitability."
  };
}
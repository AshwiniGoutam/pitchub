import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeMarketNews(newsItems) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Prepare news summary with better formatting
    const newsSummary = newsItems
      .slice(0, 30) // Increased to analyze more items
      .map(
        (item, index) =>
          `📰 ${index + 1}. ${item.source}\n📝 ${item.title}\n📊 ${item.content.substring(
            0,
            200 // Increased content length for better analysis
          )}...`
      )
      .join("\n\n");

    const prompt = `
    As a senior investment analyst at a top venture capital firm, analyze the following market news and provide strategic insights for high-net-worth investors and VC partners.

    RECENT INVESTMENT NEWS:
    ${newsSummary}

    Provide your analysis in this exact JSON format without any additional text:
    {
      "marketSentiment": "Bullish/Neutral/Bearish",
      "keyTrends": ["trend1", "trend2", "trend3", "trend4", "trend5", "trend6"], // Increased trends
      "sectorOpportunities": [
        {
          "sector": "Sector Name",
          "outlook": "Positive/Neutral/Negative",
          "reason": "Brief strategic explanation",
          "confidence": "High/Medium/Low",
          "timeHorizon": "Short-term (0-6 months)/Medium-term (6-18 months)/Long-term (18+ months)"
        }
      ],
      "riskFactors": ["risk1", "risk2", "risk3", "risk4", "risk5"], // Increased risks
      "investmentRecommendations": ["specific_recommendation1", "specific_recommendation2", "specific_recommendation3", "specific_recommendation4"], // Increased recommendations
      "emergingThemes": ["theme1", "theme2", "theme3", "theme4", "theme5", "theme6"], // Increased themes
      "marketSummary": "Comprehensive 4-5 paragraph analysis of current market conditions, focusing on venture capital opportunities, startup ecosystem trends, and strategic investment implications. Include specific sectors showing promise and caution areas."
    }

    Focus analysis on:
    - Venture capital funding rounds and trends
    - Startup valuation multiples and exit opportunities
    - Emerging technology sectors with high growth potential
    - Geographic investment hotspots and regulatory changes
    - Early-stage vs late-stage investment opportunities
    - Portfolio diversification strategies
    - Market timing and entry points
    - Risk-adjusted return expectations

    Be specific, data-driven, and actionable in your recommendations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean and parse JSON response
    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();

    try {
      const analysis = JSON.parse(cleanedText);
      return enhanceAnalysis(analysis);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.log("Raw response:", text);
      return getEnhancedFallbackAnalysis(newsItems);
    }
  } catch (error) {
    console.error("Error analyzing market news:", error);
    return getEnhancedFallbackAnalysis(newsItems);
  }
}

function enhanceAnalysis(analysis) {
  // Add timestamps and metadata
  return {
    ...analysis,
    timestamp: new Date().toISOString(),
    analysisId: `analysis_${Date.now()}`,
    version: "3.0", // Updated version
    // Ensure arrays have minimum items
    keyTrends: analysis.keyTrends?.length >= 4 ? analysis.keyTrends : getFallbackTrends(),
    emergingThemes:
      analysis.emergingThemes?.length >= 4
        ? analysis.emergingThemes
        : getFallbackThemes(),
    riskFactors:
      analysis.riskFactors?.length >= 3 ? analysis.riskFactors : getFallbackRisks(),
  };
}

function getEnhancedFallbackAnalysis(newsItems) {
  // Extract actual trends from news items for better fallback
  const extractedTrends = extractTrendsFromNews(newsItems);

  return {
    marketSentiment: "Bullish",
    keyTrends:
      extractedTrends.length >= 4
        ? extractedTrends
        : [
            "AI and ML startups attracting significant Series B+ rounds",
            "Climate tech and sustainability focus driving new fund launches",
            "Enterprise SaaS demonstrating strong revenue multiples",
            "Indian startup ecosystem maturing with larger deal sizes",
            "Early-stage valuations showing discipline despite market optimism",
            "Crypto and Web3 investments rebounding"
          ],
    sectorOpportunities: [
      {
        sector: "Enterprise SaaS",
        outlook: "Positive",
        reason: "Strong ARR growth and global customer acquisition trends",
        confidence: "High",
        timeHorizon: "Medium-term (6-18 months)",
      },
      {
        sector: "FinTech Infrastructure",
        outlook: "Positive",
        reason: "Digital payments and embedded finance scaling rapidly",
        confidence: "High",
        timeHorizon: "Long-term (18+ months)",
      },
      {
        sector: "HealthTech",
        outlook: "Positive",
        reason:
          "Telemedicine and digital health platforms gaining regulatory support",
        confidence: "Medium",
        timeHorizon: "Long-term (18+ months)",
      },
      {
        sector: "Crypto",
        outlook: "Positive",
        reason: "Blockchain adoption in finance and supply chain",
        confidence: "Medium",
        timeHorizon: "Medium-term (6-18 months)",
      }
    ],
    riskFactors: [
      "Valuation concerns in late-stage funding rounds",
      "Regulatory changes impacting cross-border investments",
      "Market volatility affecting IPO exit timelines",
      "Geopolitical tensions influencing global capital flows",
      "Inflation pressures on startup burn rates"
    ],
    investmentRecommendations: [
      "Focus on Series A companies with proven product-market fit and >$50K MRR",
      "Diversify across SaaS, FinTech, and Climate Tech with 60-30-10 allocation",
      "Consider secondary market opportunities in pre-IPO companies",
      "Maintain 20% allocation to emerging markets for diversification",
      "Explore crypto infrastructure plays with strong compliance"
    ],
    emergingThemes: [
      "AI-first enterprise solutions",
      "Climate tech and carbon accounting platforms",
      "Web3 infrastructure and blockchain scalability",
      "Digital health and remote patient monitoring",
      "Space tech and satellite connectivity",
      "Quantum computing investments"
    ],
    marketSummary: `Current venture capital landscape remains robust with continued strong investor appetite for quality technology startups. Enterprise SaaS and FinTech sectors are particularly attractive, demonstrating strong revenue growth and scalable business models. Early-stage funding shows healthy activity with disciplined valuations, while late-stage rounds are seeing increased scrutiny on unit economics.

The Indian startup ecosystem continues to mature with larger deal sizes and increased participation from global institutional investors. Climate tech and AI-driven solutions are emerging as key focus areas, attracting significant capital from both traditional VCs and corporate venture arms.

Crypto and blockchain sectors are rebounding with new regulatory clarity in some markets, offering high-risk high-reward opportunities. Healthtech continues to gain traction post-pandemic.

Strategic recommendations include focusing on companies with clear paths to profitability, maintaining portfolio diversification across stages and sectors, and actively monitoring regulatory developments that may impact investment timelines. The overall environment favors disciplined growth investing with a focus on sustainable business models.`,
    timestamp: new Date().toISOString(),
    analysisId: `fallback_${Date.now()}`,
    version: "3.0"
  };
}

function extractTrendsFromNews(newsItems) {
  const trends = new Set();

  newsItems.slice(0, 20).forEach((item) => { // Increased slice for better extraction
    const text = (item.title + " " + item.content).toLowerCase();

    if (text.includes("series a") || text.includes("early-stage")) {
      trends.add("Early-stage funding showing strong momentum");
    }
    if (text.includes("ai") || text.includes("artificial intelligence")) {
      trends.add("AI startups attracting significant investor interest");
    }
    if (text.includes("fund") || text.includes("capital")) {
      trends.add("New fund launches targeting specific sectors");
    }
    if (text.includes("valuation") || text.includes("multiple")) {
      trends.add("Valuation discipline returning to private markets");
    }
    if (text.includes("ipo") || text.includes("exit")) {
      trends.add("IPO market showing signs of recovery");
    }
    if (text.includes("crypto") || text.includes("blockchain")) {
      trends.add("Crypto investments rebounding with regulatory clarity");
    }
  });

  return Array.from(trends);
}

function getFallbackTrends() {
  return [
    "VC funding momentum in technology sectors",
    "Early-stage startup investment activity",
    "Sector-specific fund allocations increasing",
    "AI and crypto trends accelerating"
  ];
}

function getFallbackThemes() {
  return [
    "The Creator Economy",
    "The Metaverse",
    "Longevity Tech",
    "Sustainable Energy",
    "AI Revolution",
    "Web3 Evolution"
  ];
}

function getFallbackRisks() {
  return [
    "Market volatility impacting valuations",
    "Regulatory changes affecting sectors",
    "Geopolitical risks in emerging markets"
  ];
}
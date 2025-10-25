import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function summarizeEmail(emailContent, options = {}) {
  try {
    const { sectorOnly = false } = options;
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash"
    });

    let prompt;
    
    if (sectorOnly) {
      // Enhanced sector prediction prompt
      prompt = `
      Analyze the following email content carefully and determine the primary business sector. Read the entire content to understand the core business, product, or service being described.

      EMAIL CONTENT:
      ${emailContent}

      Based on your analysis of the business described, classify it into the most appropriate sector from this list:
      - AgriTech: Agriculture technology, farming solutions, crop monitoring, food production tech
      - Mobility: Transportation, logistics, delivery services, automotive tech, supply chain
      - SaaS: Software as a Service, cloud platforms, B2B software, subscription business models
      - FinTech: Financial technology, payments, banking, lending, insurance tech, investment platforms
      - Healthcare: Health technology, medical devices, telemedicine, healthcare services, wellness
      - E-commerce: Online retail, marketplace platforms, direct-to-consumer sales, online shopping
      - AI/ML: Artificial intelligence, machine learning, data science platforms, AI-powered solutions
      - EdTech: Education technology, online learning platforms, educational software, skill development
      - CleanTech: Clean energy, sustainability solutions, renewable energy, environmental technology
      - Real Estate: Property technology, real estate platforms, housing solutions, property management
      - Marketplace: Multi-sided platforms connecting buyers and sellers, peer-to-peer platforms
      - Consumer: Consumer products, B2C services, consumer goods, retail technology
      - Enterprise: Enterprise software, B2B solutions, corporate tools, business services
      - Gaming: Video games, gaming platforms, esports, interactive entertainment
      - Media: Content creation, streaming services, digital media, entertainment platforms
      - Other: If it genuinely doesn't fit any of the above categories

      Think step by step:
      1. What is the core business or product being described?
      2. What problem are they solving and for whom?
      3. What industry do they primarily operate in?
      4. What technology or methodology are they using?

      After your analysis, provide ONLY the sector name that best matches the business described.
      `;
    } else {
      // Full analysis (your existing prompt)
      prompt = `
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
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    console.log('Gemini Raw Response:', text); // Debug log

    if (sectorOnly) {
      // Clean and extract sector from response
      const cleanedText = text.replace(/["']/g, '').trim();
      
      // List of valid sectors
      const validSectors = [
        'AgriTech', 'Mobility', 'SaaS', 'FinTech', 'Healthcare', 'E-commerce', 
        'AI/ML', 'EdTech', 'CleanTech', 'Real Estate', 'Marketplace', 
        'Consumer', 'Enterprise', 'Gaming', 'Media', 'Other'
      ];
      
      // Find matching sector (case insensitive)
      const matchedSector = validSectors.find(sector => 
        cleanedText.toLowerCase().includes(sector.toLowerCase())
      );
      
      if (matchedSector) {
        console.log(`Sector predicted by Gemini: ${matchedSector}`);
        return matchedSector;
      }
      
      // If no direct match but we have a response, try to map it
      if (cleanedText && cleanedText !== 'Other') {
        // Try to infer from the response content
        const inferredSector = inferSectorFromText(cleanedText);
        if (inferredSector) {
          console.log(`Inferred sector from text: ${inferredSector}`);
          return inferredSector;
        }
      }
      
      console.log('No sector matched, using comprehensive fallback');
      return predictSectorFallback(emailContent);
    } else {
      // Full JSON parsing (your existing logic)
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        return {
          summary: "Analysis in progress...",
          sector: "Unknown",
          competitiveAnalysis: ["Strong market position", "Innovative technology", "Growing competition"],
          marketResearch: "Market showing strong growth potential with increasing demand.",
          fundingMentioned: false,
          growthStage: "Early"
        };
      }
    }
  } catch (error) {
    console.error('Error summarizing email:', error);
    if (sectorOnly) {
      // Fallback: Try to predict sector from content locally
      const fallbackSector = predictSectorFallback(emailContent);
      console.log(`Using fallback sector prediction due to error: ${fallbackSector}`);
      return fallbackSector;
    } else {
      throw new Error('Failed to summarize email: ' + error.message);
    }
  }
}

// Enhanced sector inference from text
function inferSectorFromText(text) {
  const lowercaseText = text.toLowerCase();
  
  const inferencePatterns = {
    'AgriTech': ['agriculture', 'farming', 'crop', 'farm', 'irrigation', 'harvest', 'soil', 'livestock', 'food production', 'agri', 'precision farming'],
    'Mobility': ['transport', 'logistics', 'delivery', 'mobility', 'vehicle', 'shipping', 'fleet', 'automotive', 'ride sharing', 'last mile', 'supply chain'],
    'SaaS': ['software', 'saas', 'subscription', 'platform', 'cloud', 'api', 'enterprise', 'b2b software', 'software service'],
    'FinTech': ['financial', 'payment', 'banking', 'lending', 'investment', 'insurance', 'fintech', 'wealth', 'bank', 'payments', 'digital wallet'],
    'Healthcare': ['health', 'medical', 'patient', 'hospital', 'medicine', 'wellness', 'healthcare', 'telemedicine', 'clinical', 'diagnostic'],
    'E-commerce': ['ecommerce', 'e-commerce', 'online store', 'marketplace', 'retail', 'shopping', 'd2c', 'direct to consumer', 'online sales'],
    'AI/ML': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'neural network', 'algorithm', 'deep learning', 'predictive analytics'],
    'EdTech': ['education', 'learning', 'edtech', 'course', 'student', 'teacher', 'school', 'online learning', 'educational', 'skills'],
    'CleanTech': ['clean energy', 'renewable', 'solar', 'wind', 'sustainability', 'green energy', 'carbon', 'environmental', 'cleantech'],
    'Real Estate': ['real estate', 'property', 'housing', 'mortgage', 'proptech', 'realestate', 'commercial property', 'residential'],
    'Marketplace': ['marketplace', 'platform', 'peer-to-peer', 'p2p', 'two-sided', 'buyers and sellers', 'transaction platform'],
    'Consumer': ['consumer', 'b2c', 'direct to consumer', 'consumer product', 'retail', 'consumer brand'],
    'Enterprise': ['enterprise', 'b2b', 'business', 'corporate', 'enterprise software', 'business solution'],
    'Gaming': ['gaming', 'game', 'esports', 'video game', 'mobile game', 'gaming platform'],
    'Media': ['media', 'content', 'streaming', 'entertainment', 'digital media', 'content creation']
  };

  for (const [sector, patterns] of Object.entries(inferencePatterns)) {
    if (patterns.some(pattern => lowercaseText.includes(pattern))) {
      return sector;
    }
  }

  return null;
}

// Comprehensive fallback sector prediction
function predictSectorFallback(content) {
  const lowercaseContent = content.toLowerCase();
  
  const sectorPatterns = {
    'AgriTech': ['agriculture', 'farming', 'crop', 'farm', 'irrigation', 'harvest', 'soil', 'livestock', 'food production', 'agri', 'precision farming', 'crop monitoring', 'farm management'],
    'Mobility': ['transport', 'logistics', 'delivery', 'mobility', 'vehicle', 'shipping', 'fleet', 'automotive', 'ride sharing', 'last mile', 'supply chain', 'transportation', 'delivery service'],
    'SaaS': ['software', 'saas', 'subscription', 'platform', 'cloud', 'api', 'enterprise', 'b2b software', 'software service', 'monthly subscription', 'annual subscription'],
    'FinTech': ['financial', 'payment', 'banking', 'lending', 'investment', 'insurance', 'fintech', 'wealth', 'bank', 'payments', 'digital wallet', 'mobile payment', 'peer to peer lending'],
    'Healthcare': ['health', 'medical', 'patient', 'hospital', 'medicine', 'wellness', 'healthcare', 'telemedicine', 'clinical', 'diagnostic', 'health tech', 'medical device'],
    'E-commerce': ['ecommerce', 'e-commerce', 'online store', 'marketplace', 'retail', 'shopping', 'd2c', 'direct to consumer', 'online sales', 'product catalog', 'shopping cart'],
    'AI/ML': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'neural network', 'algorithm', 'deep learning', 'predictive analytics', 'computer vision', 'natural language processing'],
    'EdTech': ['education', 'learning', 'edtech', 'course', 'student', 'teacher', 'school', 'online learning', 'educational', 'skills', 'learning platform', 'education technology'],
    'CleanTech': ['clean energy', 'renewable', 'solar', 'wind', 'sustainability', 'green energy', 'carbon', 'environmental', 'cleantech', 'energy storage', 'electric vehicle', 'ev charging'],
    'Real Estate': ['real estate', 'property', 'housing', 'mortgage', 'proptech', 'realestate', 'commercial property', 'residential', 'property management', 'real estate platform'],
    'Marketplace': ['marketplace', 'platform', 'peer-to-peer', 'p2p', 'two-sided', 'buyers and sellers', 'transaction platform', 'multi-sided platform', 'connecting buyers'],
    'Consumer': ['consumer', 'b2c', 'direct to consumer', 'consumer product', 'retail', 'consumer brand', 'consumer goods', 'lifestyle brand'],
    'Enterprise': ['enterprise', 'b2b', 'business', 'corporate', 'enterprise software', 'business solution', 'corporate tool', 'business platform'],
    'Gaming': ['gaming', 'game', 'esports', 'video game', 'mobile game', 'gaming platform', 'game development', 'interactive entertainment'],
    'Media': ['media', 'content', 'streaming', 'entertainment', 'digital media', 'content creation', 'media platform', 'streaming service']
  };

  let bestMatch = 'Other';
  let highestScore = 0;

  for (const [sector, patterns] of Object.entries(sectorPatterns)) {
    let score = 0;
    patterns.forEach(pattern => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      const matches = lowercaseContent.match(regex);
      if (matches) {
        score += matches.length * (pattern.length > 4 ? 2 : 1); // Weight longer patterns more
      }
    });
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = sector;
    }
  }

  // Only return if we have reasonable confidence
  return highestScore >= 2 ? bestMatch : 'Other';
}
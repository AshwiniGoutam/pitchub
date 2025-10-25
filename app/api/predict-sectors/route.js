import { summarizeEmail } from '../../../lib/gemini';

// Enhanced Keyword to sector mapping
const sectorKeywords = {
  'AgriTech': [
    'agritech', 'agriculture technology', 'farming', 'crop', 'farm', 'agricultural',
    'precision farming', 'smart farming', 'food production', 'sustainable agriculture',
    'crop monitoring', 'soil health', 'irrigation', 'harvest', 'livestock', 'agri',
    'food security', 'vertical farming', 'hydroponics', 'aquaponics', 'agribusiness',
    'farm management', 'crop yield', 'agriculture innovation', 'digital farming',
    'crop protection', 'agricultural robotics', 'farm tech', 'agriculture platform'
  ],
  'Mobility': [
    'mobility', 'transportation', 'logistics', 'automotive', 'autonomous vehicles',
    'electric vehicles', 'ev', 'ride sharing', 'ride-hailing', 'last mile delivery',
    'supply chain', 'fleet management', 'smart transportation', 'urban mobility',
    'public transit', 'micromobility', 'scooters', 'bike sharing', 'car sharing',
    'transport tech', 'delivery services', 'shipping', 'freight', 'logistics tech',
    'vehicle tracking', 'route optimization', 'delivery platform', 'mobility as a service'
  ],
  'SaaS': [
    'software as a service', 'saas', 'subscription', 'monthly recurring revenue', 'mrr', 
    'annual recurring revenue', 'arr', 'cloud software', 'web application', 'platform',
    'api', 'integration', 'enterprise software', 'b2b software', 'product-led growth',
    'customer relationship management', 'crm', 'enterprise resource planning', 'erp',
    'business intelligence', 'bi', 'workflow automation', 'digital transformation',
    'software platform', 'cloud-based solution', 'subscription model', 'software service'
  ],
  'FinTech': [
    'fintech', 'financial technology', 'banking', 'payments', 'lending', 'investment',
    'wealth management', 'blockchain', 'crypto', 'digital wallet', 'mobile payments',
    'insurtech', 'regtech', 'financial services', 'neobank', 'digital bank', 'paytech',
    'investment platform', 'peer-to-peer lending', 'p2p lending', 'digital insurance',
    'payment processing', 'financial inclusion', 'robo-advisor', 'stock trading',
    'digital payments', 'financial platform', 'banking technology', 'payment gateway'
  ],
  'Healthcare': [
    'healthtech', 'healthcare', 'medical', 'telemedicine', 'digital health', 'patient',
    'health records', 'ehr', 'electronic health records', 'medical device', 'biotech',
    'pharmaceutical', 'clinical', 'health insurance', 'wellness', 'fitness', 'medtech',
    'health diagnostics', 'remote patient monitoring', 'healthcare analytics', 'hospital',
    'health app', 'mental health', 'healthcare platform', 'medical technology',
    'healthcare solution', 'medical platform', 'patient care', 'healthcare innovation'
  ],
  'E-commerce': [
    'ecommerce', 'e-commerce', 'online store', 'marketplace', 'retail', 'shopping',
    'd2c', 'direct to consumer', 'consumer goods', 'product sales', 'merchandise',
    'inventory', 'logistics', 'supply chain', 'last mile delivery', 'online marketplace',
    'social commerce', 'online retail', 'digital storefront', 'shopping cart',
    'payment gateway', 'order management', 'customer reviews', 'product catalog',
    'online shopping', 'retail platform', 'ecommerce platform', 'digital commerce'
  ],
  'AI/ML': [
    'artificial intelligence', 'ai', 'machine learning', 'ml', 'deep learning',
    'neural networks', 'natural language processing', 'nlp', 'computer vision',
    'predictive analytics', 'data science', 'algorithm', 'automation', 'intelligent',
    'ai platform', 'ml model', 'ai solution', 'cognitive computing', 'ai-driven',
    'automated intelligence', 'smart algorithm', 'ai technology', 'machine intelligence',
    'ai powered', 'machine learning model', 'ai system', 'intelligent system'
  ],
  'EdTech': [
    'edtech', 'education technology', 'online learning', 'e-learning', 'educational',
    'course platform', 'learning management', 'lms', 'digital education', 'skills',
    'training', 'tutoring', 'remote learning', 'educational software', 'education platform',
    'virtual classroom', 'online courses', 'skill development', 'educational content',
    'learning platform', 'education app', 'digital learning', 'educational technology',
    'learning solution', 'education innovation', 'digital classroom', 'online education'
  ],
  'CleanTech': [
    'cleantech', 'clean technology', 'renewable energy', 'solar', 'wind', 'sustainability',
    'green energy', 'carbon reduction', 'environmental', 'climate tech', 'ev', 'electric vehicle',
    'energy storage', 'battery', 'sustainable', 'green tech', 'carbon footprint',
    'renewables', 'solar power', 'wind energy', 'clean energy', 'environmental tech',
    'sustainability solution', 'green technology', 'carbon neutral', 'clean energy solution'
  ],
  'Real Estate': [
    'proptech', 'real estate', 'property', 'housing', 'commercial real estate', 'residential',
    'real estate technology', 'property management', 'mortgage', 'real estate investment',
    'property tech', 'smart home', 'real estate platform', 'property listing',
    'real estate analytics', 'property valuation', 'real estate market', 'housing tech',
    'property search', 'real estate brokerage', 'digital mortgage', 'property technology',
    'real estate solution', 'property platform', 'real estate innovation'
  ],
  'Marketplace': [
    'marketplace', 'platform', 'peer-to-peer', 'p2p', 'two-sided market', 'transaction platform',
    'buyer seller platform', 'online marketplace', 'digital marketplace', 'service marketplace',
    'product marketplace', 'gig economy', 'sharing economy', 'platform economy',
    'multi-sided platform', 'exchange platform', 'trading platform', 'vendor platform',
    'marketplace platform', 'connecting buyers', 'connecting sellers', 'transaction platform'
  ],
  'Consumer': [
    'consumer tech', 'consumer goods', 'b2c', 'business to consumer', 'consumer product',
    'retail tech', 'consumer app', 'lifestyle', 'consumer brand', 'direct to consumer',
    'd2c brand', 'consumer electronics', 'consumer service', 'consumer platform',
    'consumer solution', 'consumer innovation', 'consumer technology'
  ],
  'Enterprise': [
    'enterprise', 'b2b', 'business to business', 'enterprise solution', 'corporate',
    'business software', 'enterprise platform', 'b2b service', 'enterprise tech',
    'business platform', 'corporate solution', 'enterprise grade', 'business tool',
    'enterprise software', 'business solution', 'corporate platform'
  ],
  'Gaming': [
    'gaming', 'game', 'esports', 'video games', 'mobile gaming', 'game development',
    'gaming platform', 'game studio', 'interactive entertainment', 'gaming tech',
    'game streaming', 'gaming community', 'virtual reality gaming', 'vr gaming',
    'gaming industry', 'video game platform', 'gaming experience'
  ],
  'Media': [
    'media', 'entertainment', 'content', 'streaming', 'digital media', 'content creation',
    'media platform', 'entertainment tech', 'digital content', 'media streaming',
    'content platform', 'entertainment platform', 'media technology', 'digital entertainment',
    'content streaming', 'media solution', 'entertainment content'
  ]
};

// Function to predict sector using enhanced keyword matching
function predictSectorByKeywords(content) {
  const lowercaseContent = content.toLowerCase();
  const sectorScores = {};
  
  // Calculate scores for each sector based on keyword matches
  Object.entries(sectorKeywords).forEach(([sector, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      // Use word boundary matching for better accuracy
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = lowercaseContent.match(regex);
      if (matches) {
        // Weight by keyword importance (exact matches get higher score)
        score += matches.length * (keyword.length > 3 ? 2 : 1);
      }
    });
    if (score > 0) {
      sectorScores[sector] = score;
    }
  });
  
  // Return the sector with highest score if above threshold
  if (Object.keys(sectorScores).length > 0) {
    const topSector = Object.keys(sectorScores).reduce((a, b) => 
      sectorScores[a] > sectorScores[b] ? a : b
    );
    
    // Only return if confidence is high enough (at least 3 points)
    if (sectorScores[topSector] >= 3) {
      return topSector;
    }
  }
  
  return null; // No confident prediction
}

export async function POST(request) {
  try {
    const { emails } = await request.json();

    if (!emails || !Array.isArray(emails)) {
      return Response.json({ error: 'Emails array is required' }, { status: 400 });
    }

    console.log(`Starting enhanced sector prediction for ${emails.length} emails...`);

    const sectorResults = [];
    let geminiRequests = 0;
    let keywordMatches = 0;
    let fallbackUsed = 0;
    
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      try {
        console.log(`Predicting sector for email ${i + 1}/${emails.length}: ${email.id}`);
        
        // First try enhanced keyword matching
        let sector = predictSectorByKeywords(email.content + ' ' + email.subject);
        let method = 'keywords';
        
        // If keyword matching fails, use enhanced Gemini
        if (!sector) {
          geminiRequests++;
          console.log(`Keyword matching failed for email ${email.id}, using Gemini...`);
          
          try {
            sector = await summarizeEmail(email.content + ' ' + email.subject, { sectorOnly: true });
            method = 'gemini';
            
            // If Gemini returns null/undefined, use fallback
            if (!sector) {
              fallbackUsed++;
              sector = 'Other';
              method = 'fallback';
              console.log(`Gemini returned no sector, using fallback for email ${email.id}`);
            }
          } catch (geminiError) {
            console.error(`Gemini failed for email ${email.id}:`, geminiError);
            fallbackUsed++;
            sector = 'Other';
            method = 'fallback';
          }
          
          // Small delay for Gemini requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));
        } else {
          keywordMatches++;
          console.log(`Sector predicted via keywords for email ${email.id}: ${sector}`);
        }
        
        sectorResults.push({
          emailId: email.id,
          sector: sector,
          method: method
        });

        // Very small delay between emails
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      } catch (error) {
        console.error(`Error predicting sector for email ${email.id}:`, error);
        // Use fallback prediction even on error
        fallbackUsed++;
        sectorResults.push({
          emailId: email.id,
          sector: 'Other',
          method: 'error_fallback'
        });
      }
    }

    console.log(`Sector prediction completed. Stats: ${keywordMatches} keywords, ${geminiRequests} Gemini, ${fallbackUsed} fallback`);
    
    return Response.json({ 
      status: 'completed',
      sectors: sectorResults,
      stats: {
        totalEmails: emails.length,
        keywordMatches: keywordMatches,
        geminiRequests: geminiRequests,
        fallbackUsed: fallbackUsed
      }
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ 
      error: 'Failed to predict sectors',
      details: error.message 
    }, { status: 500 });
  }
}
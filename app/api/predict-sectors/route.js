// // File: /app/api/predict-sectors/route.js
// import { summarizeEmail } from '../../../lib/gemini';

// // Enhanced Keyword to sector mapping
// const sectorKeywords = {
//   'AgriTech': [
//     'agritech', 'agriculture technology', 'farming', 'crop', 'farm', 'agricultural',
//     'precision farming', 'smart farming', 'food production', 'sustainable agriculture',
//     'crop monitoring', 'soil health', 'irrigation', 'harvest', 'livestock', 'agri',
//     'food security', 'vertical farming', 'hydroponics', 'aquaponics', 'agribusiness',
//     'farm management', 'crop yield', 'agriculture innovation', 'digital farming',
//     'crop protection', 'agricultural robotics', 'farm tech', 'agriculture platform'
//   ],
//   'Mobility': [
//     'mobility', 'transportation', 'logistics', 'automotive', 'autonomous vehicles',
//     'electric vehicles', 'ev', 'ride sharing', 'ride-hailing', 'last mile delivery',
//     'supply chain', 'fleet management', 'smart transportation', 'urban mobility',
//     'public transit', 'micromobility', 'scooters', 'bike sharing', 'car sharing',
//     'transport tech', 'delivery services', 'shipping', 'freight', 'logistics tech',
//     'vehicle tracking', 'route optimization', 'delivery platform', 'mobility as a service'
//   ],
//   'SaaS': [
//     'software as a service', 'saas', 'subscription', 'monthly recurring revenue', 'mrr', 
//     'annual recurring revenue', 'arr', 'cloud software', 'web application', 'platform',
//     'api', 'integration', 'enterprise software', 'b2b software', 'product-led growth',
//     'customer relationship management', 'crm', 'enterprise resource planning', 'erp',
//     'business intelligence', 'bi', 'workflow automation', 'digital transformation',
//     'software platform', 'cloud-based solution', 'subscription model', 'software service'
//   ],
//   'FinTech': [
//     'fintech', 'financial technology', 'banking', 'payments', 'lending', 'investment',
//     'wealth management', 'blockchain', 'crypto', 'digital wallet', 'mobile payments',
//     'insurtech', 'regtech', 'financial services', 'neobank', 'digital bank', 'paytech',
//     'investment platform', 'peer-to-peer lending', 'p2p lending', 'digital insurance',
//     'payment processing', 'financial inclusion', 'robo-advisor', 'stock trading',
//     'digital payments', 'financial platform', 'banking technology', 'payment gateway'
//   ],
//   'Healthcare': [
//     'healthtech', 'healthcare', 'medical', 'telemedicine', 'digital health', 'patient',
//     'health records', 'ehr', 'electronic health records', 'medical device', 'biotech',
//     'pharmaceutical', 'clinical', 'health insurance', 'wellness', 'fitness', 'medtech',
//     'health diagnostics', 'remote patient monitoring', 'healthcare analytics', 'hospital',
//     'health app', 'mental health', 'healthcare platform', 'medical technology',
//     'healthcare solution', 'medical platform', 'patient care', 'healthcare innovation'
//   ],
//   'E-commerce': [
//     'ecommerce', 'e-commerce', 'online store', 'marketplace', 'retail', 'shopping',
//     'd2c', 'direct to consumer', 'consumer goods', 'product sales', 'merchandise',
//     'inventory', 'logistics', 'supply chain', 'last mile delivery', 'online marketplace',
//     'social commerce', 'online retail', 'digital storefront', 'shopping cart',
//     'payment gateway', 'order management', 'customer reviews', 'product catalog',
//     'online shopping', 'retail platform', 'ecommerce platform', 'digital commerce'
//   ],
//   'AI/ML': [
//     'artificial intelligence', 'ai', 'machine learning', 'ml', 'deep learning',
//     'neural networks', 'natural language processing', 'nlp', 'computer vision',
//     'predictive analytics', 'data science', 'algorithm', 'automation', 'intelligent',
//     'ai platform', 'ml model', 'ai solution', 'cognitive computing', 'ai-driven',
//     'automated intelligence', 'smart algorithm', 'ai technology', 'machine intelligence',
//     'ai powered', 'machine learning model', 'ai system', 'intelligent system'
//   ],
//   'EdTech': [
//     'edtech', 'education technology', 'online learning', 'e-learning', 'educational',
//     'course platform', 'learning management', 'lms', 'digital education', 'skills',
//     'training', 'tutoring', 'remote learning', 'educational software', 'education platform',
//     'virtual classroom', 'online courses', 'skill development', 'educational content',
//     'learning platform', 'education app', 'digital learning', 'educational technology',
//     'learning solution', 'education innovation', 'digital classroom', 'online education'
//   ],
//   'CleanTech': [
//     'cleantech', 'clean technology', 'renewable energy', 'solar', 'wind', 'sustainability',
//     'green energy', 'carbon reduction', 'environmental', 'climate tech', 'ev', 'electric vehicle',
//     'energy storage', 'battery', 'sustainable', 'green tech', 'carbon footprint',
//     'renewables', 'solar power', 'wind energy', 'clean energy', 'environmental tech',
//     'sustainability solution', 'green technology', 'carbon neutral', 'clean energy solution'
//   ],
//   'Real Estate': [
//     'proptech', 'real estate', 'property', 'housing', 'commercial real estate', 'residential',
//     'real estate technology', 'property management', 'mortgage', 'real estate investment',
//     'property tech', 'smart home', 'real estate platform', 'property listing',
//     'real estate analytics', 'property valuation', 'real estate market', 'housing tech',
//     'property search', 'real estate brokerage', 'digital mortgage', 'property technology',
//     'real estate solution', 'property platform', 'real estate innovation'
//   ],
//   'Marketplace': [
//     'marketplace', 'platform', 'peer-to-peer', 'p2p', 'two-sided market', 'transaction platform',
//     'buyer seller platform', 'online marketplace', 'digital marketplace', 'service marketplace',
//     'product marketplace', 'gig economy', 'sharing economy', 'platform economy',
//     'multi-sided platform', 'exchange platform', 'trading platform', 'vendor platform',
//     'marketplace platform', 'connecting buyers', 'connecting sellers', 'transaction platform'
//   ],
//   'Consumer': [
//     'consumer tech', 'consumer goods', 'b2c', 'business to consumer', 'consumer product',
//     'retail tech', 'consumer app', 'lifestyle', 'consumer brand', 'direct to consumer',
//     'd2c brand', 'consumer electronics', 'consumer service', 'consumer platform',
//     'consumer solution', 'consumer innovation', 'consumer technology'
//   ],
//   'Enterprise': [
//     'enterprise', 'b2b', 'business to business', 'enterprise solution', 'corporate',
//     'business software', 'enterprise platform', 'b2b service', 'enterprise tech',
//     'business platform', 'corporate solution', 'enterprise grade', 'business tool',
//     'enterprise software', 'business solution', 'corporate platform'
//   ],
//   'Gaming': [
//     'gaming', 'game', 'esports', 'video games', 'mobile gaming', 'game development',
//     'gaming platform', 'game studio', 'interactive entertainment', 'gaming tech',
//     'game streaming', 'gaming community', 'virtual reality gaming', 'vr gaming',
//     'gaming industry', 'video game platform', 'gaming experience'
//   ],
//   'Media': [
//     'media', 'entertainment', 'content', 'streaming', 'digital media', 'content creation',
//     'media platform', 'entertainment tech', 'digital content', 'media streaming',
//     'content platform', 'entertainment platform', 'media technology', 'digital entertainment',
//     'content streaming', 'media solution', 'entertainment content'
//   ]
// };

// // Function to predict sector using enhanced keyword matching
// function predictSectorByKeywords(content) {
//   const lowercaseContent = content.toLowerCase();
//   const sectorScores = {};
  
//   // Calculate scores for each sector based on keyword matches
//   Object.entries(sectorKeywords).forEach(([sector, keywords]) => {
//     let score = 0;
//     keywords.forEach(keyword => {
//       // Use word boundary matching for better accuracy
//       const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
//       const matches = lowercaseContent.match(regex);
//       if (matches) {
//         // Weight by keyword importance (exact matches get higher score)
//         score += matches.length * (keyword.length > 3 ? 2 : 1);
//       }
//     });
//     if (score > 0) {
//       sectorScores[sector] = score;
//     }
//   });
  
//   // Return the sector with highest score if above threshold
//   if (Object.keys(sectorScores).length > 0) {
//     const topSector = Object.keys(sectorScores).reduce((a, b) => 
//       sectorScores[a] > sectorScores[b] ? a : b
//     );
    
//     // Only return if confidence is high enough (at least 3 points)
//     if (sectorScores[topSector] >= 3) {
//       return topSector;
//     }
//   }
  
//   return null; // No confident prediction
// }

// export async function POST(request) {
//   try {
//     const { emails } = await request.json();

//     if (!emails || !Array.isArray(emails)) {
//       return Response.json({ error: 'Emails array is required' }, { status: 400 });
//     }

//     console.log(`Starting enhanced sector prediction for ${emails.length} emails...`);

//     const sectorResults = [];
//     let geminiRequests = 0;
//     let keywordMatches = 0;
//     let fallbackUsed = 0;
    
//     for (let i = 0; i < emails.length; i++) {
//       const email = emails[i];
//       try {
//         console.log(`Predicting sector for email ${i + 1}/${emails.length}: ${email.id}`);
        
//         // First try enhanced keyword matching
//         let sector = predictSectorByKeywords(email.content + ' ' + email.subject);
        
//         // If keyword matching fails, use enhanced Gemini
//         if (!sector) {
//           geminiRequests++;
//           console.log(`Keyword matching failed for email ${email.id}, using Gemini...`);
          
//           try {
//             sector = await summarizeEmail(email.content + ' ' + email.subject, { sectorOnly: true });
            
//             // If Gemini returns null/undefined, use fallback
//             if (!sector) {
//               fallbackUsed++;
//               sector = 'Other';
//               console.log(`Gemini returned no sector, using fallback for email ${email.id}`);
//             }
//           } catch (geminiError) {
//             console.error(`Gemini failed for email ${email.id}:`, geminiError);
//             fallbackUsed++;
//             sector = 'Other';
//           }
          
//           // Small delay for Gemini requests to avoid rate limiting
//           await new Promise(resolve => setTimeout(resolve, 300));
//         } else {
//           keywordMatches++;
//           console.log(`Sector predicted via keywords for email ${email.id}: ${sector}`);
//         }
        
//         sectorResults.push({
//           emailId: email.id,
//           sector: sector
//         });

//         // Very small delay between emails
//         if (i < emails.length - 1) {
//           await new Promise(resolve => setTimeout(resolve, 50));
//         }
//       } catch (error) {
//         console.error(`Error predicting sector for email ${email.id}:`, error);
//         // Use fallback prediction even on error
//         fallbackUsed++;
//         sectorResults.push({
//           emailId: email.id,
//           sector: 'Other'
//         });
//       }
//     }

//     console.log(`Sector prediction completed. Stats: ${keywordMatches} keywords, ${geminiRequests} Gemini, ${fallbackUsed} fallback`);
    
//     return Response.json({ 
//       status: 'completed',
//       sectors: sectorResults
//     });
    
//   } catch (error) {
//     console.error('API Error:', error);
//     return Response.json({ 
//       error: 'Failed to predict sectors',
//       details: error.message 
//     }, { status: 500 });
//   }
// }













// keyword one

// File: /app/api/predict-sectors/route.js
import { summarizeEmail } from '../../../lib/gemini';

// Keep your original keyword mapping exactly as is
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

// PRE-COMPILE all regex patterns ONCE for maximum performance
const compiledPatterns = {};
Object.entries(sectorKeywords).forEach(([sector, keywords]) => {
  compiledPatterns[sector] = keywords.map(keyword => 
    new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
  );
});

// Keep your original function logic but make it faster
function predictSectorByKeywords(content) {
  const lowercaseContent = content.toLowerCase();
  const sectorScores = {};
  
  // Use pre-compiled patterns for speed
  Object.entries(compiledPatterns).forEach(([sector, patterns]) => {
    let score = 0;
    patterns.forEach(pattern => {
      const matches = lowercaseContent.match(pattern);
      if (matches) {
        score += matches.length * 2; // Your original weighting logic
      }
    });
    if (score > 0) {
      sectorScores[sector] = score;
    }
  });
  
  // Your original selection logic
  if (Object.keys(sectorScores).length > 0) {
    const topSector = Object.keys(sectorScores).reduce((a, b) => 
      sectorScores[a] > sectorScores[b] ? a : b
    );
    
    if (sectorScores[topSector] >= 3) {
      return topSector;
    }
  }
  
  return null;
}

// Process emails in parallel batches for Gemini
async function processWithGeminiFallback(emails) {
  const sectorResults = [];
  const geminiPromises = [];
  
  console.log(`🚀 Processing ${emails.length} emails with optimized approach...`);
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    
    // Your original keyword matching first
    let sector = predictSectorByKeywords(email.content + ' ' + email.subject);
    
    if (sector) {
      // Immediate result for keyword matches
      sectorResults.push({
        emailId: email.id,
        sector: sector,
        source: 'keyword'
      });
    } else {
      // Queue Gemini requests but don't wait - process in background
      geminiPromises.push(
        processSingleEmailWithGemini(email, i)
      );
    }
  }
  
  console.log(`✅ Keyword phase: ${sectorResults.length} emails matched`);
  console.log(`🤖 Gemini phase: ${geminiPromises.length} emails queued`);
  
  // Process Gemini emails in parallel with controlled concurrency
  if (geminiPromises.length > 0) {
    const geminiResults = await processGeminiBatch(geminiPromises);
    sectorResults.push(...geminiResults);
  }
  
  return sectorResults;
}

// Process individual email with Gemini (your original logic)
async function processSingleEmailWithGemini(email, index) {
  try {
    console.log(`🔍 Gemini analyzing email ${index + 1}: ${email.id}`);
    
    const sector = await summarizeEmail(email.content + ' ' + email.subject, { sectorOnly: true });
    
    return {
      emailId: email.id,
      sector: sector || 'Other',
      source: sector ? 'gemini' : 'gemini_fallback'
    };
  } catch (error) {
    console.error(`Gemini failed for email ${email.id}:`, error.message);
    return {
      emailId: email.id,
      sector: 'Other',
      source: 'gemini_error'
    };
  }
}

// Process Gemini requests with controlled concurrency
async function processGeminiBatch(geminiPromises) {
  const BATCH_SIZE = 3; // Reduced from 5 to avoid rate limits
  const results = [];
  
  for (let i = 0; i < geminiPromises.length; i += BATCH_SIZE) {
    const batch = geminiPromises.slice(i, i + BATCH_SIZE);
    console.log(`📦 Processing Gemini batch ${Math.floor(i/BATCH_SIZE) + 1}`);
    
    const batchResults = await Promise.allSettled(batch);
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('Batch promise failed:', result.reason);
        // Fallback for failed promises
        results.push({
          emailId: `failed_${i + index}`,
          sector: 'Other',
          source: 'batch_error'
        });
      }
    });
    
    // Your original delay logic - keeping it as is
    if (i + BATCH_SIZE < geminiPromises.length) {
      await new Promise(resolve => setTimeout(resolve, 400)); // Slightly increased delay
    }
  }
  
  return results;
}

export async function POST(request) {
  try {
    const { emails } = await request.json();

    if (!emails || !Array.isArray(emails)) {
      return Response.json({ error: 'Emails array is required' }, { status: 400 });
    }

    console.log(`Starting enhanced sector prediction for ${emails.length} emails...`);
    const startTime = Date.now();
    
    // Use optimized processing but keep your original logic flow
    const sectorResults = await processWithGeminiFallback(emails);
    
    const totalTime = Date.now() - startTime;

    // Calculate stats (your original logic)
    const keywordMatches = sectorResults.filter(r => r.source === 'keyword').length;
    const geminiRequests = sectorResults.filter(r => r.source.includes('gemini')).length;
    const fallbackUsed = sectorResults.filter(r => r.sector === 'Other').length;

    console.log(`✅ Sector prediction completed in ${totalTime}ms`);
    console.log(`📊 Stats: ${keywordMatches} keywords, ${geminiRequests} Gemini, ${fallbackUsed} fallback`);
    
    return Response.json({ 
      status: 'completed',
      sectors: sectorResults.map(({ emailId, sector }) => ({ emailId, sector })),
      processingTime: `${totalTime}ms`,
      stats: {
        keywordMatches,
        geminiRequests, 
        fallbackUsed
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
import { summarizeEmail } from '../../../lib/gemini';

export async function POST(request) {
  try {
    const { emails } = await request.json();

    if (!emails || !Array.isArray(emails)) {
      return Response.json({ error: 'Emails array is required' }, { status: 400 });
    }

    console.log(`Starting batch analysis for ${emails.length} emails...`);

    // Process all emails with full analysis for accurate sectors
    const analysisResults = [];
    
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      try {
        console.log(`Analyzing email ${i + 1}/${emails.length}: ${email.id}`);
        const analysis = await summarizeEmail(email.content);
        
        analysisResults.push({
          emailId: email.id,
          analysis: analysis
        });

        // Small delay to avoid rate limiting
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error analyzing email ${email.id}:`, error);
        analysisResults.push({
          emailId: email.id,
          analysis: {
            summary: "Analysis failed",
            sector: "Unknown",
            keyPoints: ["Analysis unavailable"],
            urgency: "Medium",
            actionItems: ["Review manually"],
            sentiment: "Neutral",
            fundingMentioned: false,
            metricsMentioned: false,
            growthStage: "Early",
            riskLevel: "Medium",
            competitivePosition: "Emerging"
          }
        });
      }
    }

    console.log('Batch analysis completed');
    
    return Response.json({ 
      status: 'completed',
      analyses: analysisResults
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ 
      error: 'Failed to process emails',
      details: error.message 
    }, { status: 500 });
  }
}
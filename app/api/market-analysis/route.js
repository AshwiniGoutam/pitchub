import { fetchMarketNews, categorizeNews } from '../../../lib/marketAgent';
import { analyzeMarketNews } from '../../../lib/marketAnalysis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit')) || 25;
    const refresh = searchParams.get('refresh');

    console.log('🚀 Starting market analysis request...');

    // Fetch latest news with caching consideration
    const allNews = await fetchMarketNews();
    const categorizedNews = categorizeNews(allNews);

    let newsToAnalyze = allNews;
    
    // Filter by category if specified
    if (category && categorizedNews[category]) {
      newsToAnalyze = categorizedNews[category];
    }

    // Get AI analysis (can be cached in production)
    const analysis = await analyzeMarketNews(newsToAnalyze);

    const response = {
      timestamp: new Date().toISOString(),
      newsCount: allNews.length,
      analysis,
      news: {
        all: allNews.slice(0, limit),
        categorized: Object.keys(categorizedNews).reduce((acc, key) => {
          // Only include categories with actual content
          if (categorizedNews[key].length > 0) {
            acc[key] = categorizedNews[key].slice(0, 6);
          }
          return acc;
        }, {})
      },
      metadata: {
        version: '2.0',
        sources: allNews.reduce((acc, item) => {
          acc[item.source] = (acc[item.source] || 0) + 1;
          return acc;
        }, {})
      }
    };

    console.log(`✅ Analysis complete: ${allNews.length} articles processed`);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('❌ Market analysis API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch market analysis',
        details: error.message,
        fallback: true
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
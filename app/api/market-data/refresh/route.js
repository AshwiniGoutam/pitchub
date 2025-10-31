// app/api/market-data/refresh/route.js
import { NextResponse } from 'next/server';
import { RSS_FEEDS } from '@/lib/rss-config';
import { parseRSS, categorizeArticles, analyzeMarketTrends } from '@/lib/rss-utils';

export async function GET() {
  try {
    console.log('Refreshing market data via API...');
    
    const fetchPromises = RSS_FEEDS.map(feed => 
      parseRSS(feed.url, feed.name)
    );
    
    const results = await Promise.allSettled(fetchPromises);
    const allArticles = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .flat()
      .filter(article => article && article.title);
    
    // Remove duplicates
    const uniqueArticles = allArticles.filter((article, index, self) =>
      index === self.findIndex(a => a.title === article.title && a.source.name === article.source.name)
    );
    
    // Categorize articles
    const categorized = categorizeArticles(uniqueArticles);
    
    // Analyze trends
    const trends = analyzeMarketTrends(categorized);
    
    // Mock investor thesis
    const investorThesis = {
      keywords: ["AI", "renewable", "fintech", "healthcare", "investment", "innovation", "technology", "startup", "funding"]
    };

    console.log(`API refresh successful: ${categorized.length} articles`);

    return NextResponse.json({
      success: true,
      data: {
        categorizedNews: categorized,
        marketTrends: trends,
        investorThesis,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error in market data refresh:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refresh market data' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
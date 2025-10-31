// app/market-research/page.js
import MarketResearchClient from './market-research-client';
import { RSS_FEEDS } from '@/lib/rss-config';
import { parseRSS, categorizeArticles, analyzeMarketTrends } from '@/lib/rss-utils';

// Server-side data fetching
async function fetchMarketData() {
  try {
    console.log('Fetching market data from RSS feeds...');
    
    // Fetch all RSS feeds in parallel with timeout
    const fetchPromises = RSS_FEEDS.map(feed => 
      Promise.race([
        parseRSS(feed.url, feed.name),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]).catch(error => {
        console.error(`Timeout or error fetching ${feed.name}:`, error.message);
        return []; // Return empty array on error
      })
    );
    
    const results = await Promise.allSettled(fetchPromises);
    
    // Combine all successful results
    const allArticles = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .flat()
      .filter(article => article && article.title); // Filter out invalid articles
    
    console.log(`Total articles fetched: ${allArticles.length}`);
    
    if (allArticles.length === 0) {
      throw new Error('No articles could be fetched from any RSS feed');
    }
    
    // Remove duplicates based on title
    const uniqueArticles = allArticles.filter((article, index, self) =>
      index === self.findIndex(a => a.title === article.title && a.source.name === article.source.name)
    );
    
    console.log(`Unique articles after deduplication: ${uniqueArticles.length}`);
    
    // Categorize articles
    const categorized = categorizeArticles(uniqueArticles);
    
    // Analyze trends
    const trends = analyzeMarketTrends(categorized);
    
    // Mock investor thesis for demo (replace with your actual data source)
    const investorThesis = {
      keywords: ["AI", "renewable", "fintech", "healthcare", "investment", "innovation", "technology", "startup", "funding"]
    };
    
    return {
      categorizedNews: categorized,
      marketTrends: trends,
      investorThesis,
      timestamp: new Date().toISOString(),
      error: false,
      sourcesFetched: RSS_FEEDS.length,
      articlesCount: categorized.length
    };
    
  } catch (error) {
    console.error('Error in server-side data fetching:', error.message);
    
    // Return error state instead of mock data
    return {
      categorizedNews: [],
      marketTrends: null,
      investorThesis: null,
      timestamp: new Date().toISOString(),
      error: true,
      errorMessage: error.message
    };
  }
}

export default async function MarketResearchPage() {
  // Fetch data on the server
  const marketData = await fetchMarketData();
  
  return (
    <MarketResearchClient 
      initialData={marketData}
    />
  );
}

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request
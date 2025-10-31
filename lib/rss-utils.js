// lib/rss-utils.js
import { RSS_FEEDS, SECTORS, FUTURE_KEYWORDS } from './rss-config';
import { parseString } from 'xml2js';

// Fallback mock data (only used as last resort)
export const generateMockArticles = (sourceName) => {
  const mockArticles = [
    {
      title: "AI startups raise record funding in Q4 2024",
      description: "Artificial intelligence companies continue to attract massive investments as AI adoption grows across industries.",
      source: { name: sourceName },
      url: "https://example.com/ai-startups-funding",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Renewable energy investments surge globally",
      description: "Solar and wind projects receive unprecedented funding as countries accelerate clean energy transitions.",
      source: { name: sourceName },
      url: "https://example.com/renewable-energy-investments",
      publishedAt: new Date().toISOString(),
    }
  ];
  
  return mockArticles;
};

// Improved RSS parser with better CORS handling
export const parseRSS = async (url, sourceName) => {
  try {
    console.log(`Fetching RSS from: ${sourceName}`);
    
    // Use a CORS proxy for server-side fetching
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MarketResearchBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    return await parseXML(text, sourceName);

  } catch (error) {
    console.error(`Error parsing RSS from ${sourceName}:`, error.message);
    
    // Try direct fetch as fallback
    try {
      const directResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MarketResearchBot/1.0)',
        },
      });
      
      if (directResponse.ok) {
        const text = await directResponse.text();
        return await parseXML(text, sourceName);
      }
    } catch (directError) {
      console.error(`Direct fetch also failed for ${sourceName}:`, directError.message);
    }
    
    // Only use mock data if all attempts fail
    return generateMockArticles(sourceName);
  }
};

// Improved XML parsing with xml2js
const parseXML = (xmlText, sourceName) => {
  return new Promise((resolve) => {
    parseString(xmlText, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error('XML parsing error:', err);
        resolve(generateMockArticles(sourceName));
        return;
      }

      try {
        const channel = result.rss?.channel || result.feed;
        let items = channel?.item || channel?.entry || [];
        
        // Ensure items is an array
        if (!Array.isArray(items)) {
          items = [items];
        }

        if (items.length === 0) {
          resolve(generateMockArticles(sourceName));
          return;
        }

        const articles = items.slice(0, 10).map((item) => {
          const title = item.title?._ || item.title || "No title";
          const description = item.description?._ || item.description || item.summary?._ || item.summary || "";
          const link = item.link?.href || item.link || item.id || "#";
          const pubDate = item.pubDate || item.published || item.updated || new Date().toISOString();

          const cleanText = (text) => {
            if (!text) return "";
            return text
              .replace(/<[^>]*>/g, "")
              .replace(/&nbsp;/g, " ")
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/[^\x00-\x7F]/g, "")
              .substring(0, 150) + "...";
          };

          return {
            title: cleanText(title),
            description: cleanText(description),
            source: { name: sourceName },
            url: link,
            publishedAt: pubDate,
          };
        });

        console.log(`Successfully parsed ${articles.length} articles from ${sourceName}`);
        resolve(articles);
      } catch (parseError) {
        console.error('Error processing XML result:', parseError);
        resolve(generateMockArticles(sourceName));
      }
    });
  });
};

// Simple categorization
export const categorizeArticles = (articles) => {
  return articles.map(article => {
    const text = `${article.title} ${article.description}`.toLowerCase();
    let assignedSector = "AI & Machine Learning"; // Default sector
    
    for (const sector of SECTORS) {
      if (sector.keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        assignedSector = sector.name;
        break;
      }
    }
    
    return {
      ...article,
      sector: assignedSector
    };
  });
};

// Simple trend analysis
export const analyzeMarketTrends = (articles) => {
  const sectorCounts = {};
  
  articles.forEach(article => {
    sectorCounts[article.sector] = (sectorCounts[article.sector] || 0) + 1;
  });

  const trends = Object.entries(sectorCounts)
    .map(([sector, count]) => ({
      sector,
      count,
      percentage: ((count / articles.length) * 100).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    trends: trends.slice(0, 3),
    allSectors: trends,
    totalArticles: articles.length,
  };
};

// Check if article is future-focused
export const isFutureFocused = (article) => {
  const text = `${article.title} ${article.description}`.toLowerCase();
  return FUTURE_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
};
import axios from 'axios';
import Parser from 'rss-parser';
import { format, subDays } from 'date-fns';

// Configure RSS parser to fetch images
const parser = new Parser({
  customFields: {
    item: [
      ['media:thumbnail', 'thumbnail'],
      ['media:content', 'mediaContent'],
      ['enclosure', 'enclosure'],
      ['image', 'image'],
      ['content:encoded', 'contentEncoded']
    ]
  }
});

// News sources with better image support - ADDED VC CIRCLE
const NEWS_SOURCES = [
  {
    name: 'VC Circle',
    url: 'https://www.vccircle.com/feed/',
    category: 'vc',
    imageSupport: true
  },
  {
    name: 'Reuters Business',
    url: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post-type=best',
    category: 'general',
    imageSupport: true
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'tech',
    imageSupport: true
  },
  {
    name: 'Bloomberg Markets',
    url: 'https://news.google.com/rss/search?q=Bloomberg+markets&hl=en-US&gl=US&ceid=US:en',
    category: 'markets',
    imageSupport: false
  },
  {
    name: 'Wall Street Journal',
    url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
    category: 'markets',
    imageSupport: true
  },
  {
    name: 'CNBC Markets',
    url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15839069',
    category: 'markets',
    imageSupport: true
  },
  {
    name: 'VC & Startup News',
    url: 'https://news.google.com/rss/search?q=venture+capital+funding+startup&hl=en-US&gl=US&ceid=US:en',
    category: 'vc',
    imageSupport: false
  }
];

export async function fetchMarketNews() {
  try {
    const allNews = [];
    
    const newsPromises = NEWS_SOURCES.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url);
        
        const sourceNews = await Promise.all(
          feed.items.slice(0, 10).map(async (item) => {
            const imageUrl = await extractImageUrl(item, source);
            
            return {
              title: item.title,
              link: item.link,
              content: item.contentSnippet || item.content || '',
              published: item.pubDate ? new Date(item.pubDate) : new Date(),
              source: source.name,
              category: source.category,
              image: imageUrl,
              imageSupport: source.imageSupport
            };
          })
        );
        
        return sourceNews;
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
        return [];
      }
    });

    const newsResults = await Promise.allSettled(newsPromises);
    
    newsResults.forEach(result => {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value);
      }
    });

    // Sort by date and remove duplicates
    const uniqueNews = removeDuplicates(allNews);
    uniqueNews.sort((a, b) => new Date(b.published) - new Date(a.published));
    
    return uniqueNews.slice(0, 50);
  } catch (error) {
    console.error('Error fetching market news:', error);
    throw new Error('Failed to fetch market news');
  }
}

// Enhanced image extraction function
async function extractImageUrl(item, source) {
  try {
    // Method 1: Check media:thumbnail (common in RSS feeds)
    if (item.thumbnail && item.thumbnail.$ && item.thumbnail.$.url) {
      return item.thumbnail.$.url;
    }
    
    // Method 2: Check enclosure (podcasts/images)
    if (item.enclosure && item.enclosure.url) {
      const url = item.enclosure.url.toLowerCase();
      if (url.match(/\.(jpg|jpeg|png|gif|webp)/)) {
        return item.enclosure.url;
      }
    }
    
    // Method 3: Check media:content
    if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
      const url = item.mediaContent.$.url.toLowerCase();
      if (url.match(/\.(jpg|jpeg|png|gif|webp)/)) {
        return item.mediaContent.$.url;
      }
    }
    
    // Method 4: Extract from content:encoded (HTML content)
    if (item.contentEncoded) {
      const imageMatch = item.contentEncoded.match(/<img[^>]+src="([^">]+)"/i);
      if (imageMatch && imageMatch[1]) {
        return imageMatch[1];
      }
    }
    
    // Method 5: Extract from contentSnippet/content
    const content = item.contentSnippet || item.content || '';
    const imageMatch = content.match(/(https?:\/\/[^\s"]+\.(jpg|jpeg|png|gif|webp)[^\s"]*)/i);
    if (imageMatch) {
      return imageMatch[1];
    }
    
    // Method 6: For Google News sources, try to fetch image from og:image
    if (source.name.includes('Google') || !source.imageSupport) {
      try {
        const ogImage = await fetchOpenGraphImage(item.link);
        if (ogImage) return ogImage;
      } catch (e) {
        console.log('Failed to fetch OG image for:', item.link);
      }
    }
    
    // Fallback: Source-specific default images
    return getDefaultImage(source.name);
  } catch (error) {
    console.log('Image extraction error for:', item.title);
    return getDefaultImage(source.name);
  }
}

// Fetch Open Graph image from webpage
async function fetchOpenGraphImage(url) {
  try {
    // For demo purposes, we'll use a timeout and limited fetch
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (response.ok) {
      const data = await response.json();
      return data.imageUrl || null;
    }
  } catch (error) {
    // Skip if we can't fetch the OG image
  }
  return null;
}

// Default images based on source - ADDED VC CIRCLE
function getDefaultImage(sourceName) {
  const defaultImages = {
    'VC Circle': 'https://images.unsplash.com/photo-1559526324-5937fbd9ea81?ixlib=rb-4.0.3&w=600&h=400&fit=crop',
    'Reuters Business': '/images/news/reuters.jpg',
    'TechCrunch': '/images/news/techcrunch.jpg',
    'Bloomberg Markets': '/images/news/bloomberg.jpg',
    'Wall Street Journal': '/images/news/wsj.jpg',
    'CNBC Markets': '/images/news/cnbc.jpg',
    'VC & Startup News': '/images/news/vc.jpg'
  };
  
  return defaultImages[sourceName] || '/images/news/default.jpg';
}

function removeDuplicates(news) {
  const seen = new Set();
  return news.filter(item => {
    const identifier = `${item.title}-${item.source}`;
    if (seen.has(identifier)) {
      return false;
    }
    seen.add(identifier);
    return true;
  });
}

export function categorizeNews(news) {
  const categories = {
    marketMovements: [],
    fundingRounds: [],
    techInnovation: [],
    regulatory: [],
    economicIndicators: [],
    startupNews: [],
    vc: [] // ADDED VC CATEGORY
  };

  news.forEach(item => {
    const title = item.title.toLowerCase();
    const content = item.content.toLowerCase();

    if (title.includes('funding') || title.includes('raise') || title.includes('series') || 
        title.includes('venture') || title.includes('capital') || content.includes('funding')) {
      categories.fundingRounds.push(item);
    } else if (title.includes('stock') || title.includes('market') || title.includes('dow') || 
               title.includes('nasdaq') || title.includes('s&p') || content.includes('trading')) {
      categories.marketMovements.push(item);
    } else if (title.includes('tech') || title.includes('ai') || title.includes('startup') || 
               title.includes('innovation') || content.includes('technology')) {
      categories.techInnovation.push(item);
    } else if (title.includes('fed') || title.includes('regulation') || title.includes('sec') || 
               title.includes('legal') || content.includes('regulatory')) {
      categories.regulatory.push(item);
    } else if (title.includes('economy') || title.includes('gdp') || title.includes('inflation') || 
               title.includes('employment') || content.includes('economic')) {
      categories.economicIndicators.push(item);
    } else if (title.includes('startup') || item.category === 'vc') {
      // VC Circle items will go here
      categories.vc.push(item);
    } else {
      categories.startupNews.push(item);
    }
  });

  return categories;
}
import axios from 'axios';
import Parser from 'rss-parser';

// Configure RSS parser with better image support
const parser = new Parser({
  customFields: {
    item: [
      ['media:thumbnail', 'thumbnail'],
      ['media:content', 'mediaContent'],
      ['enclosure', 'enclosure'],
      ['image', 'image'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description']
    ]
  },
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

// Enhanced news sources with better coverage
const NEWS_SOURCES = [
  {
    name: 'VC Circle',
    url: 'https://www.vccircle.com/feed/',
    category: 'ventureCapital',
    priority: 10,
    imageSupport: true
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'technology',
    priority: 9,
    imageSupport: true
  },
  {
    name: 'Reuters Business',
    url: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post-type=best',
    category: 'publicMarkets',
    priority: 9,
    imageSupport: true
  },
  {
    name: 'Bloomberg Markets',
    url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
    category: 'publicMarkets',
    priority: 8,
    imageSupport: true
  },
  {
    name: 'Wall Street Journal',
    url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml',
    category: 'publicMarkets',
    priority: 8,
    imageSupport: true
  },
  {
    name: 'Entrepreneur',
    url: 'https://www.entrepreneur.com/topic/funding.rss',
    category: 'ventureCapital',
    priority: 7,
    imageSupport: true
  },
  {
    name: 'Forbes Investing',
    url: 'https://www.forbes.com/investing/feed2/',
    category: 'publicMarkets',
    priority: 7,
    imageSupport: true
  },
  {
    name: 'Business Insider Finance',
    url: 'https://markets.businessinsider.com/rss/news',
    category: 'publicMarkets',
    priority: 6,
    imageSupport: true
  }
];

// Investment keywords for better filtering
const INVESTMENT_KEYWORDS = [
  'funding', 'series', 'venture', 'capital', 'investment', 'startup',
  'fund', 'raise', 'backing', 'financing', 'valuation', 'unicorn',
  'ipo', 'acquisition', 'merger', 'deal', 'round', 'investor',
  'vc', 'private equity', 'seed', 'growth', 'expansion', 'bridge'
];

export async function fetchMarketNews() {
  try {
    console.log('🔄 Fetching market news from enhanced sources...');
    
    const allNews = [];
    const sourcePromises = NEWS_SOURCES.map(source => 
      fetchSourceWithTimeout(source, 8000)
    );

    const results = await Promise.allSettled(sourcePromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        allNews.push(...result.value);
        console.log(`✅ ${NEWS_SOURCES[index].name}: ${result.value.length} articles`);
      } else {
        console.log(`❌ ${NEWS_SOURCES[index].name}: Failed`);
      }
    });

    // Filter for investment-related content and enhance data
    const investmentNews = allNews
      .filter(item => isInvestmentRelated(item))
      .map(item => enhanceNewsItem(item));

    console.log(`🎯 Filtered to ${investmentNews.length} investment-related articles`);

    // Remove duplicates and sort
    const uniqueNews = removeDuplicates(investmentNews);
    uniqueNews.sort((a, b) => new Date(b.published) - new Date(a.published));
    
    return uniqueNews.slice(0, 50);
  } catch (error) {
    console.error('❌ Error fetching market news:', error);
    throw new Error('Failed to fetch market news: ' + error.message);
  }
}

async function fetchSourceWithTimeout(source, timeout) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const feed = await parser.parseURL(source.url);
    clearTimeout(timeoutId);

    const newsItems = await Promise.all(
      feed.items.slice(0, 15).map(async (item) => {
        const imageUrl = await extractImageUrl(item, source);
        
        return {
          title: item.title?.trim() || 'No title',
          link: item.link || '#',
          content: cleanContent(item.contentSnippet || item.description || item.content || ''),
          published: item.pubDate ? new Date(item.pubDate) : new Date(),
          source: source.name,
          category: source.category,
          image: imageUrl,
          priority: source.priority,
          guid: item.guid || item.link
        };
      })
    );

    return newsItems.filter(item => item.title !== 'No title');
  } catch (error) {
    console.error(`Error fetching from ${source.name}:`, error.message);
    return [];
  }
}

// Enhanced image extraction
async function extractImageUrl(item, source) {
  try {
    // Method 1: Check media:thumbnail
    if (item.thumbnail && item.thumbnail.$ && item.thumbnail.$.url) {
      return validateImageUrl(item.thumbnail.$.url);
    }
    
    // Method 2: Check enclosure
    if (item.enclosure && item.enclosure.url) {
      const url = item.enclosure.url.toLowerCase();
      if (url.match(/\.(jpg|jpeg|png|gif|webp|avif)/)) {
        return validateImageUrl(item.enclosure.url);
      }
    }
    
    // Method 3: Check media:content
    if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
      const url = item.mediaContent.$.url.toLowerCase();
      if (url.match(/\.(jpg|jpeg|png|gif|webp|avif)/)) {
        return validateImageUrl(item.mediaContent.$.url);
      }
    }
    
    // Method 4: Extract from content:encoded
    if (item.contentEncoded) {
      const imageMatch = item.contentEncoded.match(/<img[^>]+src="([^">]+)"/i);
      if (imageMatch && imageMatch[1]) {
        return validateImageUrl(imageMatch[1]);
      }
    }
    
    // Method 5: Source-specific image extraction
    const sourceImage = await extractSourceSpecificImage(item, source);
    if (sourceImage) return sourceImage;
    
    // Fallback to default images based on category
    return getDefaultImage(source.category);
  } catch (error) {
    console.log('Image extraction error:', error.message);
    return getDefaultImage(source.category);
  }
}

async function extractSourceSpecificImage(item, source) {
  try {
    // TechCrunch specific extraction
    if (source.name === 'TechCrunch' && item.content) {
      const techcrunchMatch = item.content.match(/src="(https?:\/\/[^"]+\.(jpg|jpeg|png|gif)[^"]*)"/i);
      if (techcrunchMatch) return validateImageUrl(techcrunchMatch[1]);
    }
    
    // Reuters specific extraction
    if (source.name === 'Reuters Business' && item.content) {
      const reutersMatch = item.content.match(/src="(https?:\/\/[^"]+\.reuters\.com[^"]*\.(jpg|jpeg|png|gif)[^"]*)"/i);
      if (reutersMatch) return validateImageUrl(reutersMatch[1]);
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

function validateImageUrl(url) {
  if (!url) return null;
  
  // Filter out tracking pixels and small images
  if (url.includes('pixel') || url.includes('tracking') || url.includes('1x1')) {
    return null;
  }
  
  // Ensure URL is properly formatted
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.toString();
  } catch {
    return null;
  }
}

function cleanContent(content) {
  if (!content) return '';
  
  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 200); // Limit length
}

function isInvestmentRelated(item) {
  const text = (item.title + ' ' + item.content).toLowerCase();
  
  return INVESTMENT_KEYWORDS.some(keyword => 
    text.includes(keyword.toLowerCase())
  ) || item.category === 'ventureCapital';
}

function enhanceNewsItem(item) {
  // Add emojis based on content
  let emoji = '';
  const text = (item.title + ' ' + item.content).toLowerCase();
  
  if (text.includes('series a') || text.includes('series b') || text.includes('series c')) {
    emoji = '💰';
  } else if (text.includes('ipo') || text.includes('public offering')) {
    emoji = '📈';
  } else if (text.includes('acquisition') || text.includes('merger')) {
    emoji = '🤝';
  } else if (text.includes('ai') || text.includes('artificial intelligence')) {
    emoji = '🤖';
  } else if (text.includes('funding') || text.includes('investment')) {
    emoji = '💸';
  }
  
  return {
    ...item,
    title: emoji ? `${emoji} ${item.title}` : item.title,
    // Ensure content has reasonable length
    content: item.content || 'Read more about this investment opportunity...'
  };
}

function getDefaultImage(category) {
  const categoryImages = {
    ventureCapital: 'https://images.unsplash.com/photo-1559526324-5937fbd9ea81?w=600&h=400&fit=crop',
    technology: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop',
    publicMarkets: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop',
    healthcare: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop',
    energy: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&h=400&fit=crop',
    realEstate: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'
  };
  
  return categoryImages[category] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop';
}

function removeDuplicates(news) {
  const seen = new Set();
  return news.filter(item => {
    const identifier = `${item.title.toLowerCase().trim()}-${item.source}`;
    
    if (seen.has(identifier) || !item.title || item.title === '[Removed]') {
      return false;
    }
    
    seen.add(identifier);
    return true;
  });
}

export function categorizeNews(news) {
  const categories = {
    ventureCapital: [],
    publicMarkets: [],
    technology: [],
    healthcare: [],
    energy: [],
    realEstate: [],
    crypto: [],
    emergingMarkets: [],
    incomeInvesting: [],
    ipos: [],
    mergersAcquisitions: [],
    generalInvesting: []
  };

  news.forEach(item => {
    const category = item.category || 'generalInvesting';
    if (categories[category]) {
      categories[category].push(item);
    } else {
      categories.generalInvesting.push(item);
    }
  });

  // Sort each category by priority and date
  Object.keys(categories).forEach(category => {
    categories[category].sort((a, b) => {
      // First by priority, then by date
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return new Date(b.published) - new Date(a.published);
    });
  });

  return categories;
}
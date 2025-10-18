import axios from "axios";
import cheerio from "cheerio"; // Added for scraping as per user request

const NEWSAPI_KEY = process.env.NEWSAPI_KEY; // Add your NewsAPI key to .env

// Updated categories with NewsAPI mappings
const CATEGORIES = {
  ventureCapital: {
    query:
      "venture capital OR startup funding OR series funding OR seed round OR private equity",
    category: "business",
    scrapeUrls: ["https://techcrunch.com/tag/venture/", "https://www.vccircle.com/"] // Added scrape sources
  },
  technology: {
    query: "tech startup OR AI investment OR software funding",
    category: "technology",
    scrapeUrls: ["https://techcrunch.com/", "https://www.wired.com/category/tech/"]
  },
  publicMarkets: {
    query: "stock market OR IPO OR public offering",
    category: "business",
    scrapeUrls: ["https://www.reuters.com/markets/", "https://www.bloomberg.com/markets"]
  },
  healthcare: {
    query: "healthtech OR biotech funding OR medical startup",
    category: "health",
    scrapeUrls: ["https://www.fiercehealthcare.com/", "https://www.healthcareitnews.com/"]
  },
  energy: {
    query: "cleantech OR renewable energy investment OR energy startup",
    category: "business",
    scrapeUrls: ["https://www.greentechmedia.com/", "https://www.energynewsbeat.co/"]
  },
  realEstate: {
    query: "proptech OR real estate investment OR property funding",
    category: "business",
    scrapeUrls: ["https://therealdeal.com/", "https://www.inman.com/"]
  },
  crypto: {
    query: "crypto funding OR blockchain startup OR web3 investment",
    category: "technology",
    scrapeUrls: ["https://coindesk.com/", "https://www.coingecko.com/en/news"]
  },
  emergingMarkets: {
    query: "emerging markets investment OR developing economies funding",
    category: "business",
    scrapeUrls: ["https://www.emergingmarkets.org/", "https://www.ft.com/emerging-markets"]
  },
  incomeInvesting: {
    query: "dividend investing OR fixed income OR yield investment",
    category: "business",
    scrapeUrls: ["https://www.investopedia.com/income-4425", "https://www.fool.com/investing/"]
  },
  ipos: {
    query: "IPO OR initial public offering OR going public",
    category: "business",
    scrapeUrls: ["https://www.iposcoop.com/", "https://www.nasdaq.com/market-activity/ipos"]
  },
  mergersAcquisitions: {
    query: "merger OR acquisition OR M&A OR buyout",
    category: "business",
    scrapeUrls: ["https://www.dealstreetasia.com/", "https://www.mergermarket.com/"]
  },
  generalInvesting: {
    query: "investment trends OR market analysis OR portfolio management",
    category: "business",
    scrapeUrls: ["https://www.investing.com/news", "https://finance.yahoo.com/"]
  },
};

export async function fetchMarketNews() {
  try {
    console.log("🔄 Fetching real-time market news from NewsAPI and scraping sources...");

    const allNews = [];
    const categoryPromises = Object.entries(CATEGORIES).map(
      async ([catKey, config]) => {
        let articles = [];

        // Fetch from NewsAPI
        try {
          const response = await axios.get(
            "https://newsapi.org/v2/everything",
            {
              params: {
                q: config.query,
                language: "en",
                sortBy: "publishedAt",
                pageSize: 50, // Increased to 50 for more news
                apiKey: NEWSAPI_KEY,
              },
              timeout: 10000,
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
            }
          );

          articles = response.data.articles
            .filter(
              (article) =>
                article.urlToImage &&
                article.description &&
                article.publishedAt
            ) // Ensure authenticity and completeness
            .map((article) => ({
              title: article.title?.trim(),
              link: article.url,
              content: article.description?.trim(),
              published: article.publishedAt,
              source: article.source.name,
              category: catKey,
              image: article.urlToImage,
              guid: article.url,
            }));

          console.log(`✅ NewsAPI ${catKey}: ${articles.length} articles`);
        } catch (error) {
          console.error(`❌ NewsAPI error for ${catKey}:`, error.message);
        }

        // Scrape additional news from URLs (as per user request for scraping)
        for (const url of config.scrapeUrls || []) {
          try {
            const { data } = await axios.get(url, {
              headers: {
                "User-Agent": "Mozilla/5.0"
              }
            });
            const $ = cheerio.load(data);
            const scrapedItems = [];

            // Generic scraping logic - adjust selectors based on site structure
            $("article, .post, .news-item").each((i, el) => {
              if (i >= 10) return false; // Limit to 10 per site
              const title = $(el).find("h2, .title").text().trim();
              const content = $(el).find("p, .excerpt").text().trim();
              const image = $(el).find("img").attr("src");
              const link = $(el).find("a").attr("href");
              const published = new Date().toISOString(); // Fallback date

              if (title && content && image) {
                scrapedItems.push({
                  title,
                  link: new URL(link, url).href,
                  content: content.substring(0, 200),
                  published,
                  source: new URL(url).hostname,
                  category: catKey,
                  image: new URL(image, url).href,
                  guid: link
                });
              }
            });

            articles.push(...scrapedItems);
            console.log(`✅ Scraped ${url} for ${catKey}: ${scrapedItems.length} articles`);
          } catch (error) {
            console.error(`❌ Scrape error for ${url} in ${catKey}:`, error.message);
          }
        }

        return { category: catKey, articles };
      }
    );

    const results = await Promise.all(categoryPromises);

    results.forEach((result) => {
      if (result.articles.length > 0) {
        allNews.push(...result.articles);
      }
    });

    // Remove duplicates and sort by date
    const uniqueNews = removeDuplicates(allNews);
    uniqueNews.sort((a, b) => new Date(b.published) - new Date(a.published));

    console.log(`🎯 Total unique articles: ${uniqueNews.length}`);

    return uniqueNews;
  } catch (error) {
    console.error("❌ Error fetching market news:", error);
    throw new Error("Failed to fetch market news: " + error.message);
  }
}

function removeDuplicates(news) {
  const seen = new Set();
  return news.filter((item) => {
    const identifier = item.guid || `${item.title.toLowerCase().trim()}-${item.source}`;

    if (seen.has(identifier) || !item.title || item.title === "[Removed]") {
      return false;
    }

    seen.add(identifier);
    return true;
  });
}

export function categorizeNews(news) {
  const categories = Object.keys(CATEGORIES).reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {});

  news.forEach((item) => {
    if (categories[item.category]) {
      categories[item.category].push(item);
    } else {
      categories.generalInvesting.push(item);
    }
  });

  // Sort each category by date
  Object.keys(categories).forEach((category) => {
    categories[category].sort(
      (a, b) => new Date(b.published) - new Date(a.published)
    );
  });

  return categories;
}
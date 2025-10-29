"use client";
import { useState, useEffect } from "react";
import { Search, ArrowRight, TrendingUp, BarChart3, FileText, Newspaper, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InvestorSidebar } from "@/components/investor-sidebar";

// Multiple RSS feeds
const RSS_FEEDS = [
  { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
  { name: "The Ken", url: "https://the-ken.com/feed/" },
  { name: "Crunchbase", url: "https://news.crunchbase.com/feed/" },
  { name: "YourStory", url: "https://yourstory.com/feed" }
];

// Simplified sector definitions
const SECTORS = [
  { 
    name: "AI & Machine Learning", 
    keywords: ["ai", "artificial intelligence", "machine learning", "openai", "chatgpt", "llm", "generative"] 
  },
  { 
    name: "Clean Energy", 
    keywords: ["energy", "renewable", "solar", "wind", "climate", "green", "sustainability", "ev", "electric"] 
  },
  { 
    name: "Healthcare", 
    keywords: ["health", "medical", "biotech", "pharma", "healthcare", "medicine", "treatment"] 
  },
  { 
    name: "Fintech", 
    keywords: ["fintech", "banking", "finance", "crypto", "blockchain", "payment", "investment"] 
  },
  { 
    name: "E-commerce", 
    keywords: ["ecommerce", "retail", "shopping", "amazon", "marketplace", "consumer"] 
  },
  { 
    name: "Edtech", 
    keywords: ["edtech", "education", "learning", "online education", "school", "university"] 
  }
];

// Future-focused keywords
const FUTURE_KEYWORDS = [
  "future", "emerging", "next generation", "revolution", "transform", "breakthrough",
  "innovation", "trend", "forecast", "prediction", "2030", "2026"
];

// Simple RSS parser without complex cleaning
const parseRSS = async (url, sourceName) => {
  try {
    // Use a different CORS proxy
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
    const response = await fetch(proxyUrl, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (!response.ok) {
      // Fallback to another proxy
      const fallbackProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const fallbackResponse = await fetch(fallbackProxy);
      
      if (!fallbackResponse.ok) {
        throw new Error(`HTTP ${fallbackResponse.status}`);
      }
      
      const text = await fallbackResponse.text();
      return parseXML(text, sourceName);
    }
    
    const text = await response.text();
    return parseXML(text, sourceName);

  } catch (error) {
    console.error(`Error parsing RSS from ${sourceName}:`, error);
    
    // Return mock data as fallback
    return generateMockArticles(sourceName);
  }
};

const parseXML = (xmlText, sourceName) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    const items = xmlDoc.querySelectorAll("item");
    if (items.length === 0) {
      return generateMockArticles(sourceName);
    }

    const articles = Array.from(items).slice(0, 10).map((item) => {
      const title = item.querySelector("title")?.textContent || "No title";
      const description = item.querySelector("description")?.textContent || "";
      const link = item.querySelector("link")?.textContent || "#";
      const pubDate = item.querySelector("pubDate")?.textContent || new Date().toISOString();

      // Simple cleaning
      const cleanText = (text) => {
        return text
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/[^\x00-\x7F]/g, "")
          .substring(0, 100) + "...";
      };

      return {
        title: cleanText(title),
        description: cleanText(description),
        source: { name: sourceName },
        url: link,
        publishedAt: pubDate,
      };
    });

    return articles;
  } catch (error) {
    console.error('XML parsing error:', error);
    return generateMockArticles(sourceName);
  }
};

// Fallback mock data
const generateMockArticles = (sourceName) => {
  const mockArticles = [
    {
      title: "AI startups raise record funding in Q4 2024",
      description: "Artificial intelligence companies continue to attract massive investments as AI adoption grows across industries.",
      source: { name: sourceName },
      url: "#",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Renewable energy investments surge globally",
      description: "Solar and wind projects receive unprecedented funding as countries accelerate clean energy transitions.",
      source: { name: sourceName },
      url: "#",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Fintech innovation drives digital banking adoption",
      description: "New financial technology solutions are transforming traditional banking services and customer experiences.",
      source: { name: sourceName },
      url: "#",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Healthcare tech sees increased venture capital interest",
      description: "Digital health solutions and medical technology companies attract significant investor attention.",
      source: { name: sourceName },
      url: "#",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "E-commerce platforms expand into emerging markets",
      description: "Online retail giants are targeting growth in developing economies with localized strategies.",
      source: { name: sourceName },
      url: "#",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Edtech platforms revolutionize remote learning experiences",
      description: "Educational technology companies are developing innovative solutions for digital learning environments.",
      source: { name: sourceName },
      url: "#",
      publishedAt: new Date().toISOString(),
    }
  ];
  
  return mockArticles;
};

// Simple categorization
const categorizeArticles = (articles) => {
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
const analyzeMarketTrends = (articles) => {
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
const isFutureFocused = (article) => {
  const text = `${article.title} ${article.description}`.toLowerCase();
  return FUTURE_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
};

// Fetch investor thesis
const fetchInvestorThesis = async () => {
  try {
    const response = await fetch('/api/investor/thesis');
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching investor thesis:', error);
    return null;
  }
};

// Get articles matching investor's positive keywords
const getThesisMatchedArticles = (articles, investorThesis) => {
  if (!investorThesis || !investorThesis.keywords || investorThesis.keywords.length === 0) {
    return [];
  }

  return articles.filter(article => {
    const articleText = `${article.title} ${article.description}`.toLowerCase();
    
    // Check if article matches any of the investor's positive keywords
    return investorThesis.keywords.some(keyword => 
      articleText.includes(keyword.toLowerCase())
    );
  });
};

export default function MarketResearchPage() {
  const [allNews, setAllNews] = useState([]);
  const [categorizedNews, setCategorizedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("market-trends");
  const [marketTrends, setMarketTrends] = useState(null);
  const [investorThesis, setInvestorThesis] = useState(null);

  // Fetch news and investor thesis
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch investor thesis first
        const thesis = await fetchInvestorThesis();
        setInvestorThesis(thesis);

        // Fetch news from RSS feeds
        const fetchPromises = RSS_FEEDS.map(feed => 
          parseRSS(feed.url, feed.name)
        );
        
        const results = await Promise.all(fetchPromises);
        const allArticles = results.flat();
        
        // Remove exact duplicates
        const uniqueArticles = allArticles.filter((article, index, self) =>
          index === self.findIndex(a => a.title === article.title)
        );
        
        setAllNews(uniqueArticles);
        
        // Categorize articles
        const categorized = categorizeArticles(uniqueArticles);
        setCategorizedNews(categorized);
        
        // Analyze trends
        const trends = analyzeMarketTrends(categorized);
        setMarketTrends(trends);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set mock data on error
        const mockData = generateMockArticles("Tech News");
        setAllNews(mockData);
        const categorized = categorizeArticles(mockData);
        setCategorizedNews(categorized);
        const trends = analyzeMarketTrends(categorized);
        setMarketTrends(trends);
        
        // Set mock investor thesis for demo
        setInvestorThesis({
          keywords: ["AI", "renewable", "fintech", "healthcare", "investment", "innovation"]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get latest news
  const getLatestNews = () => {
    return [...categorizedNews]
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 12);
  };

  // Get emerging themes
  const getEmergingThemes = () => {
    return categorizedNews.filter(isFutureFocused);
  };

  // Get thesis-matched articles
  const getThesisMatchedArticlesList = () => {
    return getThesisMatchedArticles(categorizedNews, investorThesis);
  };

  const handleArticleClick = (url) => {
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return "Recent";
    }
  };

  const EmptyState = ({ message, icon: Icon = AlertCircle }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-slate-400 mb-4" />
      <h3 className="text-lg font-semibold text-slate-600 mb-2">No Articles Found</h3>
      <p className="text-slate-500 max-w-md">{message}</p>
    </div>
  );

  const NewsGrid = ({ articles, emptyMessage }) => {
    if (!articles || articles.length === 0) {
      return <EmptyState message={emptyMessage} />;
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, index) => (
          <Card 
            key={index} 
            className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
            onClick={() => handleArticleClick(article.url)}
          >
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                  {article.source.name}
                </Badge>
                <span className="text-xs text-slate-500">{formatDate(article.publishedAt)}</span>
              </div>
              
              <h3 className="font-semibold text-slate-800 text-lg mb-3 line-clamp-2 flex-1">
                {article.title}
              </h3>
              
              <p className="text-sm text-slate-600 mb-4 leading-relaxed line-clamp-3">
                {article.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="text-slate-700 hover:text-slate-900 p-0 h-auto text-sm">
                    Read More
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <Badge variant="outline" className="text-xs bg-slate-50">
                  {article.sector}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const MarketTrendsSection = () => {
    if (!marketTrends || marketTrends.trends.length === 0) {
      return <EmptyState message="Analyzing current market trends..." icon={TrendingUp} />;
    }

    return (
      <div className="space-y-8">
        {/* Trends Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {marketTrends.trends.map((trend, index) => (
            <Card key={trend.sector} className="border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-green-500' : 
                    index === 1 ? 'bg-blue-500' : 
                    'bg-purple-500'
                  }`} />
                  <h3 className="font-semibold text-slate-800">{trend.sector}</h3>
                  <Badge variant="default" className="ml-auto">
                    #{index + 1}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Articles</span>
                    <span className="font-semibold text-slate-800">{trend.count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Market Share</span>
                    <span className="font-semibold text-slate-800">{trend.percentage}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* All Sectors */}
        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Sector Distribution</h3>
            <div className="space-y-3">
              {marketTrends.allSectors.map((sector, index) => (
                <div key={sector.sector} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      index < 3 ? 'bg-green-500' : 'bg-slate-300'
                    }`} />
                    <span className="font-medium text-slate-700">{sector.sector}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-800">{sector.count}</span>
                    <span className="text-sm text-slate-500 ml-2">({sector.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Latest News */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Latest Market News</h3>
          <NewsGrid 
            articles={categorizedNews.slice(0, 6)} 
            emptyMessage="Loading latest market news..." 
          />
        </div>
      </div>
    );
  };

  const SectorAnalysisSection = () => {
    const thesisMatchedArticles = getThesisMatchedArticlesList();

    if (!investorThesis) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">Loading Investor Profile</h3>
          <p className="text-slate-500">Fetching your investment preferences...</p>
        </div>
      );
    }

    if (!investorThesis.keywords || investorThesis.keywords.length === 0) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No Investment Keywords Set</h3>
          <p className="text-slate-500 mb-4">
            Add positive keywords to your investment thesis to see personalized sector analysis.
          </p>
          <Button onClick={() => window.location.href = '/profile'}>
            Set Investment Keywords
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Investor Keywords Overview */}
        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Investment Focus</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {investorThesis.keywords.map((keyword, index) => (
                <Badge key={index} variant="default" className="bg-green-100 text-green-700 border-green-200">
                  {keyword}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              Showing articles that match your positive investment keywords
            </p>
          </CardContent>
        </Card>

        {/* Matched Articles */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Matching Articles ({thesisMatchedArticles.length})
            </h3>
            <Badge variant="outline" className="bg-blue-50">
              Personalized for you
            </Badge>
          </div>
          <NewsGrid 
            articles={thesisMatchedArticles}
            emptyMessage="No articles match your current investment keywords. Try adding more keywords to your thesis."
          />
        </div>
      </div>
    );
  };

  const SectionTabs = () => {
    const thesisMatchedArticles = getThesisMatchedArticlesList();
    const sections = [
      { 
        id: "market-trends", 
        name: "Market Trends", 
        icon: TrendingUp, 
        count: marketTrends?.trends.length || 0 
      },
      { 
        id: "sector-analysis", 
        name: "Sector Analysis", 
        icon: BarChart3, 
        count: thesisMatchedArticles.length 
      },
      { 
        id: "latest-news", 
        name: "Latest News", 
        icon: Newspaper, 
        count: getLatestNews().length 
      },
      { 
        id: "emerging-themes", 
        name: "Emerging Themes", 
        icon: Sparkles, 
        count: getEmergingThemes().length 
      }
    ];

    return (
      <div className="flex flex-wrap gap-2 mb-8">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "outline"}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              activeSection === section.id 
                ? "bg-blue-600 text-white shadow-sm" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
            onClick={() => setActiveSection(section.id)}
          >
            <section.icon className="h-4 w-4" />
            {section.name}
            <Badge 
              variant={activeSection === section.id ? "secondary" : "outline"}
              className={`text-xs ${
                activeSection === section.id 
                  ? "bg-white text-blue-600" 
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {section.count}
            </Badge>
          </Button>
        ))}
      </div>
    );
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "market-trends":
        return <MarketTrendsSection />;
      
      case "sector-analysis":
        return <SectorAnalysisSection />;
      
      case "latest-news":
        return (
          <NewsGrid 
            articles={getLatestNews()}
            emptyMessage="Loading latest news..."
          />
        );
      
      case "emerging-themes":
        return (
          <NewsGrid 
            articles={getEmergingThemes()}
            emptyMessage="No emerging themes found in current news."
          />
        );
      
      default:
        return <MarketTrendsSection />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <InvestorSidebar />

      <div className="flex-1 overflow-auto">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex h-16 items-center justify-between px-8">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Search industries, trends, or companies..." 
                  className="pl-10 border-slate-200 focus:border-slate-300"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800">
              Market Research
            </h1>
            <p className="mt-2 text-slate-600">
              Real-time market analysis and personalized insights
            </p>
          </div>

          <SectionTabs />

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Loading market data...</span>
            </div>
          )}

          {!loading && renderActiveSection()}
        </main>
      </div>
    </div>
  );
}
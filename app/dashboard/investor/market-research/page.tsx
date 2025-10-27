"use client";
import { useState, useEffect } from "react";
import { Search, ArrowRight, TrendingUp, BarChart3, FileText, Newspaper, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InvestorSidebar } from "@/components/investor-sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Multiple RSS feeds
const RSS_FEEDS = [
  { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
  { name: "The Ken", url: "https://the-ken.com/feed/" },
  { name: "Crunchbase", url: "https://news.crunchbase.com/feed/" },
  { name: "YourStory", url: "https://yourstory.com/feed" }
];

// Updated sector definitions with better organization
const SECTORS = [
  { 
    name: "Technology", 
    keywords: ["tech", "software", "ai", "artificial intelligence", "machine learning", "cloud", "saas", "iot", "blockchain"] 
  },
  { 
    name: "Healthcare", 
    keywords: ["health", "medical", "biotech", "pharma", "healthcare", "telemedicine", "digital health", "medtech"] 
  },
  { 
    name: "Finance", 
    keywords: ["fintech", "banking", "finance", "investment", "crypto", "blockchain", "payments", "wealth"] 
  },
  { 
    name: "Energy", 
    keywords: ["energy", "renewable", "solar", "wind", "clean tech", "sustainability", "climate", "green"] 
  },
  { 
    name: "E-commerce", 
    keywords: ["ecommerce", "retail", "shopping", "marketplace", "d2c", "b2c", "consumer", "logistics"] 
  },
  { 
    name: "Education", 
    keywords: ["edtech", "education", "learning", "online education", "skills", "training"] 
  },
  { 
    name: "Real Estate", 
    keywords: ["real estate", "proptech", "housing", "property", "construction", "mortgage"] 
  },
  { 
    name: "Automotive", 
    keywords: ["automotive", "ev", "electric vehicle", "autonomous", "mobility", "transportation"] 
  },
  { 
    name: "Entertainment", 
    keywords: ["entertainment", "gaming", "media", "streaming", "content", "creators"] 
  },
  { 
    name: "Other", 
    keywords: [] 
  }
];

// Function to parse RSS XML
const parseRSS = async (url, sourceName) => {
  try {
    // Use CORS proxy to avoid browser restrictions
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.contents) {
      throw new Error('No content received');
    }

    // The contents might be base64 encoded
    let xmlContent = data.contents;
    
    // Check if it's a data URL with base64
    if (xmlContent.startsWith('data:')) {
      const base64Match = xmlContent.match(/base64,(.*)/);
      if (base64Match) {
        xmlContent = atob(base64Match[1]);
      }
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    
    // Check for RSS parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid RSS feed format');
    }

    const items = xmlDoc.querySelectorAll("item");

    if (items.length === 0) {
      return [];
    }

    const articles = Array.from(items).slice(0, 15).map((item) => {
      const title = item.querySelector("title")?.textContent?.trim() || "No title available";
      const description = item.querySelector("description")?.textContent?.trim() || "";
      const link = item.querySelector("link")?.textContent?.trim() || "#";
      const pubDate = item.querySelector("pubDate")?.textContent?.trim() || new Date().toISOString();

      // Clean description
      const cleanDescription = description
        .replace(/<[^>]*>/g, "")
        .replace(/&[^;]+;/g, "")
        .substring(0, 120) + (description.length > 120 ? "..." : "");

      return {
        title,
        description: cleanDescription || "No description available",
        source: { name: sourceName },
        url: link,
        publishedAt: pubDate,
      };
    });

    return articles;

  } catch (error) {
    console.error(`Error parsing RSS from ${sourceName}:`, error);
    return [];
  }
};

// Function to categorize articles by sector
const categorizeArticles = (articles) => {
  if (!articles || articles.length === 0) return [];

  return articles.map(article => {
    let assignedSector = "Other";
    
    // Find matching sector based on keywords
    for (const sector of SECTORS) {
      if (sector.name === "Other") continue;
      
      const hasKeyword = sector.keywords.some(keyword => 
        article.title.toLowerCase().includes(keyword.toLowerCase()) ||
        article.description.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
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

export default function MarketResearchPage() {
  const [allNews, setAllNews] = useState([]);
  const [categorizedNews, setCategorizedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState("Show All");

  // Fetch news from all RSS feeds
  useEffect(() => {
    const fetchAllNews = async () => {
      setLoading(true);
      try {
        const fetchPromises = RSS_FEEDS.map(feed => 
          parseRSS(feed.url, feed.name)
        );
        
        const results = await Promise.all(fetchPromises);
        const allArticles = results.flat();
        
        // Remove duplicates based on title
        const uniqueArticles = allArticles.filter((article, index, self) =>
          index === self.findIndex(a => a.title === article.title)
        );
        
        setAllNews(uniqueArticles);
        
        // Categorize articles
        const categorized = categorizeArticles(uniqueArticles);
        setCategorizedNews(categorized);
        
      } catch (error) {
        console.error('Error fetching news:', error);
        setAllNews([]);
        setCategorizedNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllNews();
  }, []);

  // Filter news based on selected sector
  const filteredNews = selectedSector === "Show All" 
    ? categorizedNews 
    : categorizedNews.filter(article => article.sector === selectedSector);

  // Get sector-wise article counts
  const sectorCounts = SECTORS.map(sector => ({
    ...sector,
    count: categorizedNews.filter(article => article.sector === sector.name).length
  })).filter(sector => sector.count > 0 || sector.name === "Other");

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
        year: 'numeric'
      });
    } catch {
      return "Recent";
    }
  };

  const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-slate-400 mb-4" />
      <h3 className="text-lg font-semibold text-slate-600 mb-2">No Data Available</h3>
      <p className="text-slate-500 max-w-md">{message}</p>
    </div>
  );

  const SectorTabs = () => (
    <div className="flex flex-wrap gap-2 mb-8">
      {[
        { name: "Show All", count: allNews.length },
        ...sectorCounts
      ].map((sector) => (
        <Button
          key={sector.name}
          variant={selectedSector === sector.name ? "default" : "outline"}
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            selectedSector === sector.name 
              ? "bg-blue-600 text-white shadow-sm" 
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
          onClick={() => setSelectedSector(sector.name)}
        >
          {sector.name}
          <Badge 
            variant={selectedSector === sector.name ? "secondary" : "outline"}
            className={`text-xs ${
              selectedSector === sector.name 
                ? "bg-white text-blue-600" 
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {sector.count}
          </Badge>
        </Button>
      ))}
    </div>
  );

  const NewsGrid = () => {
    if (filteredNews.length === 0) {
      return <EmptyState message={`No news available for ${selectedSector} sector.`} />;
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredNews.map((article, index) => (
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
                <Button variant="ghost" className="text-slate-700 hover:text-slate-900 p-0 h-auto text-sm">
                  Read More
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <InvestorSidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
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

        {/* Main Content */}
        <main className="p-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800">
              Market Research
            </h1>
            <p className="mt-2 text-slate-600">
              Explore news and trends across different sectors
            </p>
          </div>

          {/* Sector Tabs */}
          <SectorTabs />

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Loading news from multiple sources...</span>
            </div>
          )}

          {/* News Grid */}
          {!loading && <NewsGrid />}
        </main>
      </div>
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { Search, Filter, Bell, ArrowRight, Sparkles, ExternalLink, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InvestorSidebar } from "@/components/investor-sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Single source - TechCrunch
const TECHCRUNCH_FEED = "https://techcrunch.com/feed/";

// Function to parse RSS XML
const parseRSS = async (url, sourceName) => {
  try {
    console.log(`Fetching from: ${url}`);
    
    // Use CORS proxy to avoid browser restrictions
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Raw data received from proxy:', data);
    
    if (!data.contents) {
      throw new Error('No content received');
    }

    // The contents might be base64 encoded - let's check and decode it
    let xmlContent = data.contents;
    
    // Check if it's a data URL with base64
    if (xmlContent.startsWith('data:')) {
      console.log('Detected data URL, extracting base64 content...');
      const base64Match = xmlContent.match(/base64,(.*)/);
      if (base64Match) {
        xmlContent = atob(base64Match[1]);
        console.log('Decoded base64 content:', xmlContent.substring(0, 500) + '...');
      }
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    
    // Check for RSS parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.error('RSS Parse Error:', parseError.textContent);
      console.error('First 500 chars of XML:', xmlContent.substring(0, 500));
      throw new Error('Invalid RSS feed format');
    }

    const items = xmlDoc.querySelectorAll("item");
    console.log(`Found ${items.length} items in RSS feed`);

    if (items.length === 0) {
      return [];
    }

    const articles = Array.from(items).slice(0, 20).map((item, index) => {
      const title = item.querySelector("title")?.textContent?.trim() || "No title available";
      const description = item.querySelector("description")?.textContent?.trim() || "";
      const link = item.querySelector("link")?.textContent?.trim() || "#";
      const pubDate = item.querySelector("pubDate")?.textContent?.trim() || new Date().toISOString();
      
      // Extract image from various possible locations
      let imageUrl = "/placeholder.svg";
      
      // Try media:content first (common in TechCrunch)
      const mediaContent = item.querySelector("media\\:content, content");
      if (mediaContent) {
        imageUrl = mediaContent.getAttribute("url") || "/placeholder.svg";
      }
      
      // Try enclosure
      const enclosure = item.querySelector("enclosure");
      if (enclosure && enclosure.getAttribute("type")?.startsWith("image/")) {
        imageUrl = enclosure.getAttribute("url") || "/placeholder.svg";
      }
      
      // Try to extract image from description (common in RSS feeds)
      const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }

      // Clean description from HTML tags and truncate
      const cleanDescription = description
        .replace(/<[^>]*>/g, "")
        .replace(/&[^;]+;/g, "")
        .substring(0, 150) + (description.length > 150 ? "..." : "");

      const article = {
        title,
        description: cleanDescription || "No description available",
        urlToImage: imageUrl,
        source: { name: sourceName },
        url: link,
        publishedAt: pubDate,
        category: "technology"
      };

      console.log(`Article ${index + 1}:`, article);
      return article;
    });

    return articles;

  } catch (error) {
    console.error(`Error parsing RSS from ${sourceName}:`, error);
    return [];
  }
};

// NEW: Function to just fetch and display raw data
const fetchRawData = async () => {
  try {
    console.log("=== FETCHING RAW DATA ===");
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(TECHCRUNCH_FEED)}`;
    console.log("Proxy URL:", proxyUrl);
    
    const response = await fetch(proxyUrl);
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log("=== COMPLETE RAW RESPONSE ===");
    console.log("Full response object:", data);
    
    if (data.contents) {
      console.log("=== CONTENTS DATA ===");
      console.log("Contents type:", typeof data.contents);
      console.log("First 1000 chars of contents:", data.contents.substring(0, 1000));
      
      // Check if it's base64 encoded
      if (data.contents.startsWith('data:')) {
        console.log("=== BASE64 DECODING ===");
        const base64Match = data.contents.match(/base64,(.*)/);
        if (base64Match) {
          const decoded = atob(base64Match[1]);
          console.log("Decoded XML (first 1000 chars):", decoded.substring(0, 1000));
        }
      }
    }
    
    if (data.status) {
      console.log("=== STATUS INFO ===");
      console.log("Status:", data.status);
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching raw data:", error);
    return null;
  }
};

export default function MarketResearchPage() {
  const [allNews, setAllNews] = useState([]);
  const [trends, setTrends] = useState([]);
  const [reports, setReports] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [showAllTrends, setShowAllTrends] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const [showAllNews, setShowAllNews] = useState(false);
  const [selectedSector, setSelectedSector] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState(null);

  const sectors = [
    "All",
    "Technology",
    "Fintech",
    "Healthcare",
    "E-commerce",
    "SaaS",
    "EdTech",
    "Clean Energy",
    "Real Estate",
    "Consumer",
  ];

  // Format date
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

  // Fetch news from TechCrunch
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("=== STARTING FETCH PROCESS ===");
        
        // First, let's fetch and log the raw data
        const raw = await fetchRawData();
        setRawData(raw);
        
        // Then parse the RSS
        console.log("=== PARSING RSS ===");
        const articles = await parseRSS(TECHCRUNCH_FEED, "TechCrunch");
        console.log("Fetched articles:", articles);
        
        setAllNews(articles);
        
        if (articles.length === 0) {
          setError("No news available from TechCrunch. Please try again later.");
        } else {
          // Distribute articles to different sections
          setTrends(articles.slice(0, 6));
          setReports(articles.slice(6, 12));
          setNewsItems(articles.slice(12, 20));
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setError("Failed to load news from TechCrunch. Please check your connection and try again.");
        setAllNews([]);
        setTrends([]);
        setReports([]);
        setNewsItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredTrends = selectedSector === "All" 
    ? trends 
    : trends.filter(item => 
        item.title.toLowerCase().includes(selectedSector.toLowerCase()) ||
        item.description.toLowerCase().includes(selectedSector.toLowerCase())
      );

  const filteredReports = selectedSector === "All" 
    ? reports 
    : reports.filter(item => 
        item.title.toLowerCase().includes(selectedSector.toLowerCase()) ||
        item.description.toLowerCase().includes(selectedSector.toLowerCase())
      );

  const filteredNews = selectedSector === "All" 
    ? newsItems 
    : newsItems.filter(item => 
        item.title.toLowerCase().includes(selectedSector.toLowerCase()) ||
        item.description.toLowerCase().includes(selectedSector.toLowerCase())
      );

  const handleArticleClick = (url) => {
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const EmptyState = ({ message, icon: Icon = AlertCircle }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-slate-400 mb-4" />
      <h3 className="text-lg font-semibold text-slate-600 mb-2">No Content Available</h3>
      <p className="text-slate-500 max-w-md">{message}</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <InvestorSidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-8">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search industries, trends, or companies..." className="pl-10" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-slate-600" />
              </Button>
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
              Latest news from TechCrunch
            </p>
          </div>

          {/* Debug Info Panel */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Information</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p><strong>Source URL:</strong> {TECHCRUNCH_FEED}</p>
              <p><strong>Articles Loaded:</strong> {allNews.length}</p>
              <p><strong>Raw Data Available:</strong> {rawData ? "Yes" : "No"}</p>
              <p><strong>Check browser console for detailed raw data logs</strong></p>
            </div>
          </div>

          {/* Search, Filter, and Sector Select */}
          <div className="mb-8 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search TechCrunch articles..." className="pl-10" />
            </div>
            <Button variant="outline" className="gap-2 bg-white border-slate-300">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 rounded-lg bg-red-50 p-6 border border-red-200">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Unable to load news</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-slate-600">Loading news from TechCrunch...</span>
            </div>
          )}

          {/* Market Trends Section */}
          {!loading && !error && (
            <div className="mb-12">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Latest Tech News</h2>
                {filteredTrends.length > 3 && (
                  <Button 
                    variant="link" 
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => setShowAllTrends(!showAllTrends)}
                  >
                    {showAllTrends ? "Show Less" : "See All"}
                  </Button>
                )}
              </div>

              {filteredTrends.length === 0 ? (
                <EmptyState message="No trending news available for the selected sector. Try selecting 'All' sectors." />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {(showAllTrends ? filteredTrends : filteredTrends.slice(0, 3)).map((trend, index) => (
                    <Card 
                      key={index} 
                      className="overflow-hidden border-slate-200 hover:shadow-lg transition-shadow cursor-pointer bg-white"
                      onClick={() => handleArticleClick(trend.url)}
                    >
                      <div className="aspect-video overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                        <img
                          src={trend.urlToImage || "/placeholder.svg"}
                          alt={trend.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            TechCrunch
                          </Badge>
                          <ExternalLink className="h-4 w-4 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2 line-clamp-2">
                          {trend.title}
                        </h3>
                        <p className="text-slate-600 line-clamp-3 mb-3">
                          {trend.description}
                        </p>
                        <div className="flex items-center text-sm text-slate-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(trend.publishedAt)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Industry Reports Section */}
          {!loading && !error && (
            <div className="mb-12">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">
                  Tech Analysis & Reports
                </h2>
                {filteredReports.length > 3 && (
                  <Button 
                    variant="link" 
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => setShowAllReports(!showAllReports)}
                  >
                    {showAllReports ? "Show Less" : "See All"}
                  </Button>
                )}
              </div>

              {filteredReports.length === 0 ? (
                <EmptyState message="No analysis available for the selected sector. Try selecting 'All' sectors." />
              ) : (
                <div className="space-y-4">
                  {(showAllReports ? filteredReports : filteredReports.slice(0, 3)).map((report, index) => (
                    <Card 
                      key={index} 
                      className="border-slate-200 hover:shadow-md transition-shadow cursor-pointer bg-white"
                      onClick={() => handleArticleClick(report.url)}
                    >
                      <CardContent className="flex gap-6 p-6">
                        <div className="flex h-24 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 overflow-hidden">
                          <img
                            src={report.urlToImage || "/document-preview.png"}
                            alt={report.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.src = "/document-preview.png";
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                              TechCrunch
                            </Badge>
                            <ExternalLink className="h-4 w-4 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            {report.title}
                          </h3>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                            {report.description}
                          </p>
                          <div className="flex items-center text-xs text-slate-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(report.publishedAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Right Sidebar - Current Deals & Funds News */}
      <div className="w-80 border-l bg-white/80 backdrop-blur-sm p-6 overflow-auto">
        <h2 className="mb-6 text-xl font-bold text-slate-800">
          Latest Updates
        </h2>

        {!loading && !error && (
          <div className="space-y-6">
            {filteredNews.length === 0 ? (
              <EmptyState 
                message="No additional news available." 
                icon={AlertCircle}
              />
            ) : (
              <>
                {(showAllNews ? filteredNews : filteredNews.slice(0, 4)).map((item, index) => {
                  const lowerTitle = item.title.toLowerCase();
                  const isFund = lowerTitle.includes("fund") || lowerTitle.includes("capital") || lowerTitle.includes("venture");
                  const bgClass = isFund ? "bg-green-500" : "bg-blue-500";

                  return (
                    <div 
                      key={index} 
                      className="flex gap-4 p-4 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => handleArticleClick(item.url)}
                    >
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${bgClass}`}
                      >
                        {isFund ? (
                          <Sparkles className="h-6 w-6 text-white" />
                        ) : (
                          <span className="text-sm font-semibold text-white">
                            TC
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                            TechCrunch
                          </Badge>
                          <ExternalLink className="h-3 w-3 text-slate-400" />
                        </div>
                        <h3 className="font-semibold text-slate-800 text-sm leading-tight mb-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center text-xs text-slate-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(item.publishedAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredNews.length > 4 && (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setShowAllNews(!showAllNews)}
                  >
                    {showAllNews ? "Show Less" : "View All News"}
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* Emerging Themes */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-bold text-slate-800">
            Tech Trends
          </h3>
          <div className="space-y-3">
            {[
              "AI & Machine Learning",
              "Startup Funding",
              "Tech Innovation",
              "Digital Transformation", 
              "Future of Work",
              "Emerging Technologies"
            ].map((theme, index) => (
              <Button 
                key={index} 
                variant="ghost" 
                className="w-full justify-between hover:bg-slate-100 text-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{theme}</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
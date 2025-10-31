// app/market-research/market-research-client.js
"use client";
import { useState } from "react";
import { Search, ArrowRight, TrendingUp, BarChart3, Newspaper, Sparkles, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InvestorSidebar } from "@/components/investor-sidebar";
import { FUTURE_KEYWORDS } from "@/lib/rss-config";

export default function MarketResearchClient({ initialData }) {
  const [allNews, setAllNews] = useState(initialData.categorizedNews);
  const [marketTrends, setMarketTrends] = useState(initialData.marketTrends);
  const [investorThesis, setInvestorThesis] = useState(initialData.investorThesis);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("market-trends");
  const [lastUpdated, setLastUpdated] = useState(initialData.timestamp);
  const [error, setError] = useState(initialData.error);

  // Client-side refresh function
  const handleRefresh = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('/api/market-data/refresh');
      const result = await response.json();
      
      if (result.success) {
        setAllNews(result.data.categorizedNews);
        setMarketTrends(result.data.marketTrends);
        setInvestorThesis(result.data.investorThesis);
        setLastUpdated(new Date().toISOString());
        setError(false);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Check if article is future-focused
  const isFutureFocused = (article) => {
    const text = `${article.title} ${article.description}`.toLowerCase();
    return FUTURE_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
  };

  // Get articles matching investor's positive keywords
  const getThesisMatchedArticles = (articles) => {
    if (!investorThesis || !investorThesis.keywords || investorThesis.keywords.length === 0) {
      return [];
    }

    return articles.filter(article => {
      const articleText = `${article.title} ${article.description}`.toLowerCase();
      return investorThesis.keywords.some(keyword => 
        articleText.includes(keyword.toLowerCase())
      );
    });
  };

  // Get latest news
  const getLatestNews = () => {
    return [...allNews]
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 12);
  };

  // Get emerging themes
  const getEmergingThemes = () => {
    return allNews.filter(isFutureFocused);
  };

  // Get thesis-matched articles
  const getThesisMatchedArticlesList = () => {
    return getThesisMatchedArticles(allNews);
  };

  // Fixed article click handler - properly opens external links
  const handleArticleClick = (url) => {
    if (url && url !== "#" && !url.includes('example.com')) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (url.includes('example.com')) {
      // For mock data links, show alert or do nothing
      console.log('Mock data link clicked:', url);
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

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Just now";
    }
  };

  const EmptyState = ({ message, icon: Icon = AlertCircle }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-slate-400 mb-4" />
      <h3 className="text-lg font-semibold text-slate-600 mb-2">No Articles Found</h3>
      <p className="text-slate-500 max-w-md">{message}</p>
    </div>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to Load Data</h3>
      <p className="text-slate-500 max-w-md mb-4">
        There was an error fetching the latest market data. This might be due to CORS restrictions or RSS feed availability.
      </p>
      <Button onClick={handleRefresh} disabled={loading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Try Again
      </Button>
    </div>
  );

  const NewsGrid = ({ articles, emptyMessage }) => {
    if (error) {
      return <ErrorState />;
    }

    if (!articles || articles.length === 0) {
      return <EmptyState message={emptyMessage} />;
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, index) => (
          <Card 
            key={index} 
            className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col group"
            onClick={() => handleArticleClick(article.url)}
          >
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                  {article.source.name}
                </Badge>
                <span className="text-xs text-slate-500">{formatDate(article.publishedAt)}</span>
              </div>
              
              <h3 className="font-semibold text-slate-800 text-lg mb-3 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              
              <p className="text-sm text-slate-600 mb-4 leading-relaxed line-clamp-3">
                {article.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="hover:bg-blue-800 text-slate-700 hover:text-slate-200 cursor-pointer p-2 h-auto text-sm group-hover:text-blue-600">
                    Read More
                    <ExternalLink className="h-4 w-4 ml-1" />
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
    if (error) {
      return <ErrorState />;
    }

    if (!marketTrends || marketTrends.trends.length === 0) {
      return <EmptyState message="Analyzing current market trends..." icon={TrendingUp} />;
    }

    return (
      <div className="space-y-8">
        {/* Latest News */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Latest Market News</h3>
          <NewsGrid 
            articles={allNews.slice(0, 6)} 
            emptyMessage="Loading latest market news..." 
          />
        </div>
      </div>
    );
  };

  const SectorAnalysisSection = () => {
    const thesisMatchedArticles = getThesisMatchedArticlesList();

    if (error) {
      return <ErrorState />;
    }

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
        count: marketTrends?.trends?.length || 0 
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
            className={`flex items-center gap-2 px-4 py-2 cursor-pointer rounded-full ${
              activeSection === section.id 
                ? "bg-blue-800 text-white shadow-sm" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-500 hover:text-white"
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
              
              {/* Refresh button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {/* Last updated timestamp */}
            <div className="text-sm text-slate-500">
              Updated: {formatTime(lastUpdated)}
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
            {error && (
              <div className="mt-2 text-sm text-red-600">
                Currently showing limited data due to connection issues
              </div>
            )}
          </div>

          <SectionTabs />

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Refreshing market data...</span>
            </div>
          )}

          {!loading && renderActiveSection()}
        </main>
      </div>
    </div>
  );
}
"use client";

import { Search, Filter, Bell, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InvestorSidebar } from "@/components/investor-sidebar";
import { useEffect, useState } from "react";

export default function MarketResearchPage() {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/market-analysis');
      
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      
      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setError('Failed to load market data. Please try again.');
      
      // Set fallback data
      setMarketData(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  // Fallback data in case API fails
  const getFallbackData = () => {
    return {
      news: {
        all: [
          {
            title: "AI Startups Secure Record Funding in Q4 2024",
            content: "Artificial intelligence companies continue to attract significant venture capital investments as the technology matures.",
            source: "TechCrunch",
            image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop",
            published: new Date().toISOString(),
            category: "technology"
          },
          {
            title: "Sustainable Energy Investments Reach New High",
            content: "Global investment in renewable energy projects hits record levels as climate tech gains momentum.",
            source: "Reuters",
            image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&h=400&fit=crop",
            published: new Date().toISOString(),
            category: "energy"
          }
        ],
        categorized: {
          ventureCapital: [
            {
              title: "VC Funding Shows Strong Momentum in Tech Sector",
              content: "Early-stage startups in SaaS and AI continue to attract significant investor interest.",
              source: "VC Circle",
              image: "https://images.unsplash.com/photo-1559526324-5937fbd9ea81?w=600&h=400&fit=crop",
              published: new Date().toISOString(),
              category: "ventureCapital"
            }
          ],
          technology: [
            {
              title: "The Future of Enterprise SaaS: Trends and Projections",
              content: "Analysis of the evolving SaaS market with key investment opportunities.",
              source: "Tech Analysis",
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
              published: new Date().toISOString(),
              category: "technology"
            }
          ]
        }
      },
      analysis: {
        marketSentiment: "Bullish",
        keyTrends: [
          "AI and Machine Learning investments surging",
          "Climate tech gaining significant traction",
          "Enterprise SaaS showing strong growth",
          "Early-stage funding remains robust"
        ],
        emergingThemes: [
          "The Creator Economy",
          "The Metaverse",
          "Longevity Tech",
          "Sustainable Energy"
        ]
      }
    };
  };

  // Get first news item for trends section with proper image handling
  const getTrendNews = () => {
    if (!marketData?.news?.all?.length) return getFallbackData().news.all.slice(0, 2);
    
    const newsWithImages = marketData.news.all.filter(item => item.image);
    
    if (newsWithImages.length >= 2) {
      return newsWithImages.slice(0, 2);
    }
    
    // Fallback to any news items with placeholder images
    return marketData.news.all.slice(0, 2).map((item, index) => ({
      ...item,
      image: item.image || getPlaceholderImage(index)
    }));
  };

  // Get industry reports (categorized news)
  const getIndustryReports = () => {
    if (!marketData?.news?.categorized) return getFallbackData().news.categorized.technology.slice(0, 2);
    
    const reports = [];
    Object.entries(marketData.news.categorized).forEach(([category, items]) => {
      if (items.length > 0) {
        const item = items[0];
        reports.push({
          category: formatCategory(category),
          title: item.title,
          content: item.content,
          source: item.source,
          image: item.image || getPlaceholderImage(reports.length),
          published: item.published
        });
      }
    });
    
    return reports.slice(0, 2);
  };

  // Get deals and funds news
  const getDealsNews = () => {
    if (!marketData?.news?.all?.length) return [];
    
    const dealsNews = marketData.news.all.filter(item => 
      item.title.toLowerCase().includes('fund') || 
      item.title.toLowerCase().includes('series') ||
      item.title.toLowerCase().includes('capital') ||
      item.title.toLowerCase().includes('raise') ||
      item.title.toLowerCase().includes('venture') ||
      item.title.toLowerCase().includes('investment') ||
      item.title.toLowerCase().includes('funding')
    );
    
    return dealsNews.slice(0, 2).map((deal, index) => ({
      ...deal,
      image: deal.image || getPlaceholderImage(index)
    }));
  };

  // Get placeholder images from Unsplash
  const getPlaceholderImage = (index) => {
    const images = [
      "https://images.unsplash.com/photo-1559526324-5937fbd9ea81?w=600&h=400&fit=crop", // Business
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop", // Finance
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop", // Office
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop"  // Professional
    ];
    return images[index % images.length];
  };

  // Format category for display
  const formatCategory = (category) => {
    const categoryMap = {
      ventureCapital: 'VC & Funding',
      publicMarkets: 'Public Markets',
      technology: 'Technology',
      healthcare: 'Healthcare',
      energy: 'Energy',
      realEstate: 'Real Estate',
      crypto: 'Cryptocurrency',
      emergingMarkets: 'Emerging Markets',
      incomeInvesting: 'Income Investing',
      ipos: 'IPOs',
      mergersAcquisitions: 'M&A',
      generalInvesting: 'General Investing'
    };
    
    return categoryMap[category] || category;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <InvestorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading market data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <InvestorSidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-white">
          <div className="flex h-16 items-center justify-between px-8">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search..." className="pl-10" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              Market Research
            </h1>
            <p className="mt-2 text-gray-600">
              Explore trends, reports, and news to inform your investment strategy.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">{error}</p>
            </div>
          )}

          {/* Search and Filter */}
          <div className="mb-8 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search research..." className="pl-10" />
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button onClick={fetchMarketData} variant="outline">
              Refresh Data
            </Button>
          </div>

          {/* New Trends Section */}
          <div className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">New Trends</h2>
              <Button variant="link" className="text-emerald-600">
                See All
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {getTrendNews().map((news, index) => (
                <Card key={index} className="overflow-hidden pt-0 hover:shadow-lg transition-shadow duration-300">
                  <div className={`aspect-video bg-gradient-to-br ${
                    index === 0 ? 'from-orange-200 to-orange-300' : 'from-emerald-500 to-emerald-600'
                  }`}>
                    <img
                      src={news.image}
                      alt={news.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        // If image fails, replace with placeholder
                        e.target.src = getPlaceholderImage(index);
                      }}
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="mt-2 text-gray-600 line-clamp-2">
                      {news.content || 'Latest market trends and insights...'}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {news.source}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(news.published).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* AI-Fetched Industry Reports */}
          <div className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                AI-Fetched Industry Reports
              </h2>
              <Button variant="link" className="text-emerald-600">
                See All
              </Button>
            </div>

            <div className="space-y-4">
              {getIndustryReports().map((report, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow duration-300">
                  <CardContent className="flex gap-6 p-6">
                    <div className="flex h-24 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 overflow-hidden">
                      <img
                        src={report.image}
                        alt={report.category}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = getPlaceholderImage(index);
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2">
                        {report.category}
                      </Badge>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {report.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                        {report.content || `Analysis of the ${report.category} market, including key players, investment trends, and future projections.`}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {report.source}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(report.published).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l bg-white p-6 overflow-auto">
        <h2 className="mb-6 text-xl font-bold text-gray-900">
          Current Deals & Funds News
        </h2>

        <div className="space-y-6">
          {getDealsNews().map((deal, index) => (
            <div key={index} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-600 overflow-hidden">
                {deal.image ? (
                  <img
                    src={deal.image}
                    alt={deal.source}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : null}
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-sm font-semibold text-white">
                    {deal.source?.substring(0, 2).toUpperCase() || 'NF'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <Badge variant="secondary" className="mb-1 text-xs">
                  {deal.title.toLowerCase().includes('fund') ? 'Fund News' : 'Deal News'}
                </Badge>
                <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                  {deal.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {deal.content || 'Latest funding and investment news...'}
                </p>
                <span className="text-xs text-gray-500 mt-1 block">
                  {new Date(deal.published).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
            View All News
          </Button>
        </div>

        <div className="mt-8">
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Emerging Themes
          </h3>
          <div className="space-y-3">
            {(marketData?.analysis?.emergingThemes || [
              "The Creator Economy",
              "The Metaverse", 
              "Longevity Tech",
              "Sustainable Energy",
              "AI Revolution"
            ]).slice(0, 3).map((theme, index) => (
              <Button key={index} variant="ghost" className="w-full justify-between hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span className="line-clamp-1 text-sm">{theme}</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>

        {/* Market Sentiment */}
        {marketData?.analysis && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Market Sentiment
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${
                marketData.analysis.marketSentiment === 'Bullish' ? 'bg-green-500' :
                marketData.analysis.marketSentiment === 'Bearish' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="font-semibold capitalize">
                {marketData.analysis.marketSentiment}
              </span>
            </div>
            {marketData.analysis.keyTrends && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Key Trends:</span>
                <ul className="mt-1 space-y-1">
                  {marketData.analysis.keyTrends.slice(0, 2).map((trend, index) => (
                    <li key={index} className="line-clamp-1 text-xs">• {trend}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
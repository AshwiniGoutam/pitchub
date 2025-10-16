import { Search, Filter, Bell, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InvestorSidebar } from "@/components/investor-sidebar";

export default function MarketResearchPage() {
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
              Explore trends, reports, and news to inform your investment
              strategy.
            </p>
          </div>

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
              <Card className="overflow-hidden pt-0">
                <div className="aspect-video bg-gradient-to-br from-orange-200 to-orange-300">
                  <img
                    src="/professional-businesswoman.png"
                    alt="AI-Driven Personalization"
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    AI-Driven Personalization in E-commerce
                  </h3>
                  <p className="mt-2 text-gray-600">
                    How AI is transforming online shopping experiences.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden pt-0">
                <div className="aspect-video bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <img
                    src="/sustainable-packaging-materials.jpg"
                    alt="Sustainable Packaging"
                    className="h-60 w-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Sustainable Packaging Solutions
                  </h3>
                  <p className="mt-2 text-gray-600">
                    The rise of eco-friendly materials and practices.
                  </p>
                </CardContent>
              </Card>
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
              <Card>
                <CardContent className="flex gap-6 p-6">
                  <div className="flex h-24 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <img
                      src="/document-preview.png"
                      alt="Report"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">
                      EdTech
                    </Badge>
                    <h3 className="text-lg font-semibold text-gray-900">
                      The Future of EdTech: Trends and Opportunities
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Analysis of the evolving educational technology market,
                      including key players, investment trends, and future
                      projections.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex gap-6 p-6">
                  <div className="flex h-24 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <img
                      src="/healthcare-document.jpg"
                      alt="Report"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">
                      Healthcare
                    </Badge>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Healthcare Innovation: Digital Health and Telemedicine
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      An in-depth look at the digital transformation of
                      healthcare, focusing on telemedicine and data-driven
                      solutions.
                    </p>
                  </div>
                </CardContent>
              </Card>
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
          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-600">
              <span className="text-sm font-semibold text-white">CT</span>
            </div>
            <div>
              <Badge variant="secondary" className="mb-1 text-xs">
                Deal News
              </Badge>
              <h3 className="font-semibold text-gray-900">
                Series B for 'CogniTech'
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                CogniTech secures $20M to expand its AI analytics platform.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-700">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-1 text-xs">
                Fund News
              </Badge>
              <h3 className="font-semibold text-gray-900">
                'Innovate Capital' Launches
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                New $50M fund for early-stage sustainable tech startups.
              </p>
            </div>
          </div>

          <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
            View All News
          </Button>
        </div>

        <div className="mt-8">
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Emerging Themes
          </h3>
          <div className="space-y-3">
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>The Creator Economy</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>The Metaverse</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>Longevity Tech</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

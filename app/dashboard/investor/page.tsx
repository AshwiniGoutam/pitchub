"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Mail,
  TrendingUp,
  Users,
  Clock,
  Search,
  Filter,
  BarChart3,
} from "lucide-react";
import { InvestorSidebar } from "@/components/investor-sidebar";
import { DealCard } from "@/components/deal-card";
import { StatsCard } from "@/components/stats-card";
import InvestmentNews from "@/components/new-articles";

interface DashboardStats {
  totalPitches: number;
  newThisWeek: number;
  underReview: number;
  contacted: number;
}

interface Startup {
  _id: string;
  name: string;
  sector: string;
  stage: string;
  location: string;
  fundingRequirement: {
    min: number;
    max: number;
  };
  relevanceScore: number;
  status: string;
  createdAt: string;
  description: string;
}

export default function InvestorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPitches: 0,
    newThisWeek: 0,
    underReview: 0,
    contacted: 0,
  });
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    filterStartups();
  }, [startups, searchTerm, sectorFilter, stageFilter]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, startupsResponse] = await Promise.all([
        fetch("/api/investor/stats"),
        fetch("/api/investor/startups"),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (startupsResponse.ok) {
        const startupsData = await startupsResponse.json();
        setStartups(startupsData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const fetchDashboardData = async () => {
  //   try {
  //     // Dummy stats
  //     const statsData: DashboardStats = {
  //       totalPitches: 12,
  //       newThisWeek: 3,
  //       underReview: 5,
  //       contacted: 2,
  //     };
  //     setStats(statsData);

  //     // Dummy startups
  //     const startupsData: Startup[] = [
  //       {
  //         _id: "1",
  //         name: "FinMate",
  //         sector: "Fintech",
  //         stage: "Seed",
  //         location: "Bangalore, India",
  //         fundingRequirement: { min: 50000, max: 150000 },
  //         relevanceScore: 85,
  //         status: "under_review",
  //         createdAt: new Date().toISOString(),
  //         description: "AI-powered financial advisor for millennials.",
  //       },
  //       {
  //         _id: "2",
  //         name: "HealthifyAI",
  //         sector: "HealthTech",
  //         stage: "Series A",
  //         location: "San Francisco, USA",
  //         fundingRequirement: { min: 200000, max: 500000 },
  //         relevanceScore: 92,
  //         status: "contacted",
  //         createdAt: new Date().toISOString(),
  //         description: "Predictive health analytics using wearable data.",
  //       },
  //       {
  //         _id: "3",
  //         name: "EduPro",
  //         sector: "EdTech",
  //         stage: "Pre-Seed",
  //         location: "Delhi, India",
  //         fundingRequirement: { min: 10000, max: 50000 },
  //         relevanceScore: 60,
  //         status: "new",
  //         createdAt: new Date().toISOString(),
  //         description: "Interactive learning platform for K12 students.",
  //       },
  //     ];
  //     setStartups(startupsData);
  //   } catch (error) {
  //     console.error("Error fetching dashboard data:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const filterStartups = () => {
    let filtered = startups;

    if (searchTerm) {
      filtered = filtered.filter(
        (startup) =>
          startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          startup.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sectorFilter !== "all") {
      filtered = filtered.filter((startup) => startup.sector === sectorFilter);
    }

    if (stageFilter !== "all") {
      filtered = filtered.filter((startup) => startup.stage === stageFilter);
    }

    setFilteredStartups(filtered);
  };

  const handleStatusUpdate = async (startupId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `/api/investor/startups/${startupId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setStartups((prev) =>
          prev.map((startup) =>
            startup._id === startupId
              ? { ...startup, status: newStatus }
              : startup
          )
        );
        fetchDashboardData(); // Refresh stats
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <InvestorSidebar />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
            <p className="text-muted-foreground text-lg">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <InvestorSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome User
              </h1>
              <p className="text-muted-foreground">
                Manage and analyze your startup deal pipeline
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <StatsCard
              title="Total Pitches"
              value={stats.totalPitches}
              icon={<Mail className="h-5 w-5" />}
              trend="+12% from last month"
              color="blue"
            />
            <StatsCard
              title="New This Week"
              value={stats.newThisWeek}
              icon={<TrendingUp className="h-5 w-5" />}
              trend="+5 from last week"
              color="green"
            />
            <StatsCard
              title="Under Review"
              value={stats.underReview}
              icon={<Clock className="h-5 w-5" />}
              trend="3 pending decisions"
              color="orange"
            />
            <StatsCard
              title="Contacted"
              value={stats.contacted}
              icon={<Users className="h-5 w-5" />}
              trend="8 meetings scheduled"
              color="purple"
            />
          </div>

          {/* <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Filter & Search</h2>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search startups by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-full lg:w-56 h-12 py-5.5 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 rounded-xl">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="Fintech">Fintech</SelectItem>
                  <SelectItem value="HealthTech">HealthTech</SelectItem>
                  <SelectItem value="EdTech">EdTech</SelectItem>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                </SelectContent>
              </Select>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-full lg:w-56 h-12 py-5.5 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 rounded-xl">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                  <SelectItem value="Seed">Seed</SelectItem>
                  <SelectItem value="Series A">Series A</SelectItem>
                  <SelectItem value="Series B">Series B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-8">
            <div className="flex items-center justify-between">
              <TabsList className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 p-1 h-12 rounded-xl">
                <TabsTrigger
                  value="all"
                  className="px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  All Deals
                </TabsTrigger>
                <TabsTrigger
                  value="high-relevance"
                  className="px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  High Relevance
                </TabsTrigger>
                <TabsTrigger
                  value="under-review"
                  className="px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Under Review
                </TabsTrigger>
                <TabsTrigger
                  value="contacted"
                  className="px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Contacted
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>{filteredStartups.length} deals found</span>
              </div>
            </div>

            <TabsContent value="all" className="space-y-6">
              {filteredStartups.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
                  <CardContent className="flex items-center justify-center py-16">
                    <div className="text-center max-w-md">
                      <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <Mail className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">
                        No startups found
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Try adjusting your filters or connect your email to
                        start receiving pitches and building your deal flow.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredStartups.map((startup) => (
                    <DealCard
                      key={startup._id}
                      startup={startup}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="high-relevance" className="space-y-6">
              <div className="grid gap-6">
                {filteredStartups
                  .filter((startup) => startup.relevanceScore >= 80)
                  .map((startup) => (
                    <DealCard
                      key={startup._id}
                      startup={startup}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="under-review" className="space-y-6">
              <div className="grid gap-6">
                {filteredStartups
                  .filter((startup) => startup.status === "under_review")
                  .map((startup) => (
                    <DealCard
                      key={startup._id}
                      startup={startup}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="contacted" className="space-y-6">
              <div className="grid gap-6">
                {filteredStartups
                  .filter((startup) => startup.status === "contacted")
                  .map((startup) => (
                    <DealCard
                      key={startup._id}
                      startup={startup}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs> */}

          <InvestmentNews/>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { InvestorSidebar } from "@/components/investor-sidebar";
import { useEffect, useState } from "react";

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

export default function DashboardPage() {
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
    <div className="flex h-screen bg-gray-50">
      <InvestorSidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-white">
          <div className="flex h-16 items-center justify-between px-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Calendar className="h-4 w-4" />
                Date Range
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          {/* <p className="mb-8 text-gray-600">Here's your quality deal snapshot.</p> */}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500">Total Pitches</p>
                  <p className="text-4xl font-bold">{stats.totalPitches}</p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Quality Deal Flow</p>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-700"
                    >
                      +5% ↑
                    </Badge>
                  </div>
                  <p className="text-4xl font-bold">76</p>
                  <div className="mt-4 h-16">
                    <svg viewBox="0 0 200 50" className="w-full">
                      <path
                        d="M 0,25 Q 50,15 100,20 T 200,25"
                        fill="none"
                        stroke="rgb(16 185 129)"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Reviewed</p>
                  <p className="text-4xl font-bold">{stats.underReview}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Contacted</p>
                  <p className="text-4xl font-bold">{stats.contacted}</p>
                </div>
              </CardContent>
            </Card>

            {/* Deal Flow by Sector */}
            <Card>
              <CardHeader>
                <CardTitle>Deal Flow by Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="h-48 w-48">
                    <circle cx="100" cy="100" r="80" fill="rgb(16 185 129)" />
                    <path
                      d="M 100,100 L 100,20 A 80,80 0 0,1 180,100 Z"
                      fill="rgb(59 130 246)"
                    />
                    <path
                      d="M 100,100 L 180,100 A 80,80 0 0,1 140,170 Z"
                      fill="rgb(234 179 8)"
                    />
                    <path
                      d="M 100,100 L 140,170 A 80,80 0 0,1 60,170 Z"
                      fill="rgb(239 68 68)"
                    />
                  </svg>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span>FinTech</span>
                    </div>
                    <span className="text-gray-500">(35%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span>HealthTech</span>
                    </div>
                    <span className="text-gray-500">(30%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <span>SaaS</span>
                    </div>
                    <span className="text-gray-500">(20%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <span>DeepTech</span>
                    </div>
                    <span className="text-gray-500">(15%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Funding Round & Lead Investor Status */}
            <Card>
              <CardHeader>
                <CardTitle>Funding Round</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">First Round</span>
                    <span className="text-sm font-semibold">60%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Follow-on</span>
                    <span className="text-sm font-semibold">40%</span>
                  </div>
                  <Progress value={40} className="h-2 [&>div]:bg-blue-500" />
                </div>

                <div className="pt-4">
                  <h3 className="mb-4 font-semibold">Lead Investor Status</h3>
                  <div className="flex items-end justify-center gap-8">
                    <div className="text-center">
                      <div className="mb-2 h-32 w-16 rounded-lg bg-emerald-500" />
                      <p className="text-sm text-gray-600">Yes</p>
                    </div>
                    <div className="text-center">
                      <div className="mb-2 h-24 w-16 rounded-lg bg-red-200" />
                      <p className="text-sm text-gray-600">No</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* What's New Today */}
          <div className="my-8">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              What's New Today
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gray-200">IT</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">InnovateTech</p>
                    <p className="text-sm text-gray-500">New pitch</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gray-200">QL</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">QuantumLeap</p>
                    <p className="text-sm text-gray-500">Founder replied</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gray-200">ES</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">EcoSolutions</p>
                    <p className="text-sm text-gray-500">Follow-up</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" />
                    <AvatarFallback>DS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">DataSphere</p>
                    <p className="text-sm text-gray-500">New pitch</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

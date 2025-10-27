"use client";

import { Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { InvestorSidebar } from "@/components/investor-sidebar";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

  const data = [
    { name: "FinTech", value: 35 },
    { name: "HealthTech", value: 30 },
    { name: "SaaS", value: 20 },
    { name: "DeepTech", value: 15 },
  ];
  const COLORS = ["#10B981", "#3B82F6", "#EAB308", "#EF4444"];

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

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Summary - col-span-3 */}
            <Card className="lg:col-span-5">
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

            {/* Deal Flow by Sector - col-span-9 */}
            <Card className="lg:col-span-7 w-full">
              <CardHeader>
                <CardTitle>Deal Flow by Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {data.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
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

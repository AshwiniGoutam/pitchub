"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bell, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { InvestorSidebar } from "@/components/investor-sidebar";
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
  deals?: { total?: number; growth?: number };
}

interface Startup {
  _id: string;
  name: string;
  sector: string;
  stage: string;
  location: string;
  fundingRequirement: { min: number; max: number };
  relevanceScore: number;
  status: string;
  createdAt: string;
  description: string;
}

interface Email {
  id: string;
  from: string;
  subject: string;
  attachments?: any[];
}

export default function DashboardPage() {
  const router = useRouter();

  // ------------------ STATES ------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([]);
  const [sectorData, setSectorData] = useState<any[]>([]);

  // ------------------ API FUNCTIONS ------------------
  const fetchDashboardData = async () => {
    const [statsRes, startupsRes] = await Promise.all([
      fetch("/api/investor/stats"),
      fetch("/api/investor/startups"),
    ]);
    const stats = await statsRes.json();
    const startups = await startupsRes.json();
    return { stats, startups };
  };

  const fetchEmails = async () => {
    const res = await fetch("/api/gmail?limit=40&sort=newest");
    if (!res.ok) throw new Error("Failed to fetch emails");
    const data = await res.json();
    return data.emails || [];
  };

  const fetchThesis = async () => {
    const res = await fetch("/api/investor/thesis");
    if (!res.ok) throw new Error("Failed to fetch thesis");
    return res.json();
  };

  // ------------------ QUERIES ------------------
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: emails = [], isLoading: isEmailsLoading } = useQuery({
    queryKey: ["emails"],
    queryFn: fetchEmails,
    staleTime: 5 * 60 * 1000,
  });

  console.log("emails", emails);

  const { data: thesis, isLoading: isThesisLoading } = useQuery({
    queryKey: ["thesis"],
    queryFn: fetchThesis,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isDashboardLoading || isEmailsLoading || isThesisLoading;

  const stats = dashboardData?.stats || {
    totalPitches: 0,
    newThisWeek: 0,
    underReview: 0,
    contacted: 0,
    deals: { total: 0, growth: 0 },
  };
  const startups = dashboardData?.startups || [];

  // ------------------ EFFECTS ------------------
  // useEffect(() => {
  //   if (!Array.isArray(emails) || emails.length === 0) return;

  //   const aggregated = Object.values(
  //     emails.reduce((acc: any, curr: any) => {
  //       const sector = curr.sector || "Unknown";
  //       if (!acc[sector]) acc[sector] = { name: sector, value: 0 };
  //       acc[sector].value += 1;
  //       return acc;
  //     }, {})
  //   );
  //   setSectorData(aggregated);
  // }, [emails]);

  useEffect(() => {
    if (!Array.isArray(startups) || startups.length === 0) return;

    const aggregated = Object.values(
      startups.reduce((acc: any, curr: any) => {
        const sector = curr.sector || "Unknown";
        if (!acc[sector]) acc[sector] = { name: sector, value: 0 };
        acc[sector].value += 1;
        return acc;
      }, {})
    );

    setSectorData(aggregated);
  }, [startups]);

  useEffect(() => {
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
  }, [startups, searchTerm, sectorFilter, stageFilter]);

  // ------------------ HELPERS ------------------
  const getInitials = (name: string) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ------------------ LOADING STATE ------------------
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

  // ------------------ PIE COLORS ------------------
  const COLORS = ["#10B981", "#3B82F6", "#EAB308", "#EF4444"];

  // ------------------ RENDER ------------------
  return (
    <>
      {thesis &&
        (!thesis.sectors?.length ||
          !thesis.stages?.length ||
          !thesis.geographies?.length ||
          !thesis.keywords?.length) && (
          <div className="mb-0 p-4 border border-amber-300 bg-amber-50 text-amber-800 flex justify-between items-center">
            <div>
              <p className="font-semibold">
                Your Investment Thesis is incomplete
              </p>
              <p className="text-sm text-amber-700">
                Please complete your thesis to get better deal recommendations.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/investor/settings")}
              className="bg-white border-amber-300 text-amber-700 hover:bg-accent hover:text-white hover:border-accent cursor-pointer"
            >
              Complete Thesis
            </Button>
          </div>
        )}

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
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Summary */}
              <Card className="lg:col-span-5">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-500">Total Pitches</p>
                    <p className="text-4xl font-bold">{emails?.length}</p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm text-gray-500">Quality Deal Flow</p>
                      <Badge
                        variant="secondary"
                        className={`${
                          stats.deals?.growth >= 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {stats.deals?.growth >= 0 ? "+" : ""}
                        {stats.deals?.growth ?? 0}%{" "}
                        {stats.deals?.growth >= 0 ? "↑" : "↓"}
                      </Badge>
                    </div>

                    <p className="text-4xl font-bold">
                      {stats.deals?.total ?? 0}
                    </p>

                    <div className="mt-4 h-16">
                      <svg viewBox="0 0 200 50" className="w-full">
                        <path
                          d="M 0,25 Q 50,15 100,20 T 200,25"
                          fill="none"
                          stroke={`${
                            stats.deals?.growth >= 0
                              ? "rgb(16 185 129)"
                              : "rgb(239 68 68)"
                          }`}
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
              <Card className="lg:col-span-7 w-full">
                <CardHeader>
                  <CardTitle>Deal Flow by Sector</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sectorData}
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {sectorData.map((entry, index) => (
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  What's New Today
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard/investor/inbox")}
                  className="gap-2"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              {emails.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {emails.slice(0, 4).map((email) => (
                    <Card
                      key={email.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(email.from)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-sm">
                            {email.subject}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {email.from}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                           <Badge
                            className={`${
                              email?.status == "Contacted"
                                ? "bg-blue-100 text-blue-700"
                                : email?.status == "Under Evaluation"
                                ? "bg-yellow-100 text-yellow-700"
                                : email?.status == "Pending"
                                ? "bg-[#F7CB73] text-red-700"
                                : email?.status == "New"
                                ? "bg-emerald-100 text-emerald-700"
                                : email?.status == "Rejected"
                                ? "bg-[#D9512C] text-white":""
                            }`}
                          >
                            {email.status}
                          </Badge>
                            {email.attachments?.length > 0 && (
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {email.attachments.length}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No new emails today.</p>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

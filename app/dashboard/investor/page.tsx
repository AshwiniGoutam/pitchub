"use client";

import { Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { InvestorSidebar } from "@/components/investor-sidebar";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  status: string;
  attachments: any[];
  startup?: any;
}

interface SectorResult {
  emailId: string;
  sector: string;
}

// Color palette for sectors
const COLORS = ["#10B981", "#3B82F6", "#EAB308", "#EF4444", "#8B5CF6", "#F59E0B", "#EC4899"];

// Fetch emails from your Gmail API
const fetchEmails = async (): Promise<Email[]> => {
  const res = await fetch("/api/gmail?limit=100");
  if (!res.ok) throw new Error("Failed to fetch emails");
  const data = await res.json();
  return data.emails || [];
};

// Predict sectors for emails
const predictSectors = async (emails: Email[]): Promise<{ sectors: SectorResult[] }> => {
  const res = await fetch("/api/predict-sectors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ emails }),
  });
  if (!res.ok) throw new Error("Failed to predict sectors");
  return res.json();
};

// Fetch dashboard stats
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await fetch("/api/investor/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
};

// Fetch startups
const fetchStartups = async (): Promise<Startup[]> => {
  const res = await fetch("/api/investor/startups");
  if (!res.ok) throw new Error("Failed to fetch startups");
  return res.json();
};

// Main sector data fetcher
const fetchSectorData = async () => {
  console.log("🔍 Fetching sector data...");
  
  // Step 1: Fetch emails
  const emails = await fetchEmails();
  console.log(`📧 Found ${emails.length} emails`);
  
  if (emails.length === 0) {
    return { sectors: [], totalEmails: 0 };
  }

  // Step 2: Predict sectors
  const sectorsResponse = await predictSectors(emails);
  console.log("🎯 Sector predictions:", sectorsResponse);

  // Step 3: Calculate sector distribution
  const sectorCounts = {};
  let totalAnalyzed = 0;

  sectorsResponse.sectors?.forEach(prediction => {
    const sector = prediction.sector || 'Unknown';
    if (sector && sector !== 'Other' && sector !== 'Unknown') {
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
      totalAnalyzed++;
    }
  });

  // Convert to chart data format with percentages
  const sectorData = Object.entries(sectorCounts).map(([name, value]) => ({
    name: name,
    value: value,
    percentage: totalAnalyzed > 0 ? Math.round((value / totalAnalyzed) * 100) : 0
  })).sort((a, b) => b.value - a.value);

  console.log("📊 Final sector data:", sectorData);
  return {
    sectors: sectorData,
    totalEmails: emails.length,
    analyzedEmails: totalAnalyzed
  };
};

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([]);

  // Use React Query for all data fetching with caching
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: startups, isLoading: startupsLoading } = useQuery({
    queryKey: ['startups'],
    queryFn: fetchStartups,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: sectorData, 
    isLoading: sectorLoading, 
    error: sectorError,
    refetch: refetchSectors 
  } = useQuery({
    queryKey: ['sector-data'],
    queryFn: fetchSectorData,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: 2,
  });

  useEffect(() => {
    if (startups) {
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
    }
  }, [startups, searchTerm, sectorFilter, stageFilter]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-bold">{data.name}</p>
          <p className="text-sm">{data.value} emails ({data.percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={11}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const isLoading = statsLoading || startupsLoading || sectorLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <InvestorSidebar />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
            <p className="text-muted-foreground text-lg">
              {sectorLoading ? "Analyzing email sectors..." : "Loading your dashboard..."}
            </p>
            {sectorLoading && (
              <p className="text-sm text-gray-500 mt-2">
                Analyzing your emails to build sector distribution...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (sectorError) {
    return (
      <div className="flex h-screen">
        <InvestorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">Error loading sector data</p>
            <Button onClick={() => refetchSectors()} className="mt-4">
              Retry Analysis
            </Button>
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetchSectors()}
                disabled={sectorLoading}
              >
                {sectorLoading ? "Refreshing..." : "Refresh Data"}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Summary - col-span-3 */}
            <Card className="lg:col-span-5">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500">Total Pitches</p>
                  <p className="text-4xl font-bold">{stats?.totalPitches || 0}</p>
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
                  <p className="text-4xl font-bold">{stats?.underReview || 0}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Contacted</p>
                  <p className="text-4xl font-bold">{stats?.contacted || 0}</p>
                </div>
              </CardContent>
            </Card>

            {/* Deal Flow by Sector - col-span-9 */}
            <Card className="lg:col-span-7 w-full">
              <CardHeader>
                <CardTitle>
                  Deal Flow by Sector
                  {sectorData?.sectors && sectorData.sectors.length > 0 && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({sectorData.analyzedEmails} emails analyzed)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-100">
                  {sectorData?.sectors && sectorData.sectors.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={sectorData.sectors}
                          cx="50%"
                          cy="50%"
                          outerRadius={140}
                          innerRadius={70}
                          dataKey="value"
                          nameKey="name"
                          label={renderCustomizedLabel}
                          labelLine={false}
                        >
                          {sectorData.sectors.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          formatter={(value, entry, index) => (
                            <span style={{ color: entry.color, fontSize: '12px' }}>
                              {sectorData.sectors[index]?.name} ({sectorData.sectors[index]?.value})
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <div className="text-lg mb-2">No Email Data</div>
                      <div className="text-sm text-center mb-4">
                        {sectorData?.totalEmails > 0 
                          ? `Found ${sectorData.totalEmails} emails but couldn't analyze sectors`
                          : "No pitch emails found in your inbox"
                        }
                      </div>
                      <Button onClick={() => refetchSectors()} variant="outline">
                        Retry Analysis
                      </Button>
                    </div>
                  )}
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
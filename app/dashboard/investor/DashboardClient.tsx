"use client";

import { Bell, Calendar, RefreshCw, Mail, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { InvestorSidebar } from "@/components/investor-sidebar";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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

interface SectorData {
  sectors: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  totalEmails: number;
  analyzedEmails: number;
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

interface InvestorThesis {
  sectors: string[];
  stages: string[];
  checkSizeMin: number;
  checkSizeMax: number;
  geographies: string[];
  keywords: string[];
  excludedKeywords: string[];
}

// Color palette for sectors
const COLORS = ["#10B981", "#3B82F6", "#EAB308", "#EF4444", "#8B5CF6", "#F59E0B", "#EC4899"];

// Client-side refetch functions
const refetchSectorData = async (): Promise<SectorData> => {
  const res = await fetch("/api/sector-data");
  if (!res.ok) throw new Error("Failed to refetch sector data");
  return res.json();
};

const refetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await fetch("/api/investor/stats");
  if (!res.ok) throw new Error("Failed to refetch stats");
  return res.json();
};

const refetchStartups = async (): Promise<Startup[]> => {
  const res = await fetch("/api/investor/startups");
  if (!res.ok) throw new Error("Failed to refetch startups");
  return res.json();
};

// New function to fetch latest emails for "What's New Today"
const refetchLatestEmails = async (): Promise<Email[]> => {
  const res = await fetch("/api/gmail?limit=4&sort=newest");
  if (!res.ok) throw new Error("Failed to refetch latest emails");
  const data = await res.json();
  return data.emails || [];
};

// NEW: Function to fetch ALL emails for quality deal flow calculation
const refetchAllEmails = async (): Promise<Email[]> => {
  const res = await fetch("/api/gmail?limit=100&sort=newest");
  if (!res.ok) throw new Error("Failed to refetch all emails");
  const data = await res.json();
  return data.emails || [];
};

// Fetch investor thesis
const refetchInvestorThesis = async (): Promise<InvestorThesis> => {
  const res = await fetch("/api/investor/thesis");
  if (!res.ok) throw new Error("Failed to refetch investor thesis");
  return res.json();
};

interface DashboardClientProps {
  initialStats: DashboardStats;
  initialStartups: Startup[];
  initialSectorData: SectorData;
  initialLatestEmails: Email[];
  initialAllEmails?: Email[];
  initialThesis?: InvestorThesis;
}

export default function DashboardClient({ 
  initialStats, 
  initialStartups, 
  initialSectorData,
  initialLatestEmails,
  initialAllEmails = [],
  initialThesis 
}: DashboardClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>(initialStartups);

  // Use React Query for client-side refetching with initial data
  const { 
    data: sectorData, 
    isLoading: sectorLoading, 
    error: sectorError,
    refetch: refetchSectors 
  } = useQuery({
    queryKey: ['sector-data'],
    queryFn: refetchSectorData,
    initialData: initialSectorData,
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });

  const { 
    data: stats, 
    isLoading: statsLoading,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: refetchDashboardStats,
    initialData: initialStats,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });

  const { 
    data: startups, 
    isLoading: startupsLoading,
    refetch: refetchStartupsData 
  } = useQuery({
    queryKey: ['startups'],
    queryFn: refetchStartups,
    initialData: initialStartups,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });

  // Query for latest emails (for "What's New Today")
  const { 
    data: latestEmails, 
    isLoading: emailsLoading,
    refetch: refetchLatestEmailsData 
  } = useQuery({
    queryKey: ['latest-emails'],
    queryFn: () => refetchLatestEmails(),
    initialData: initialLatestEmails,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
  });

  // NEW: Query for ALL emails (for Quality Deal Flow calculation)
  const { 
    data: allEmails, 
    isLoading: allEmailsLoading,
    refetch: refetchAllEmailsData 
  } = useQuery({
    queryKey: ['all-emails'],
    queryFn: () => refetchAllEmails(),
    initialData: initialAllEmails,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });

  // Query for investor thesis
  const { 
    data: thesisData, 
    isLoading: thesisLoading 
  } = useQuery({
    queryKey: ['investor-thesis'],
    queryFn: refetchInvestorThesis,
    initialData: initialThesis,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });

  // Calculate emails matching investor thesis - UPDATED to use all emails
  const calculateThesisMatches = (emails: Email[], thesis: InvestorThesis): number => {
    if (!emails.length || !thesis) return 0;

    console.log(`🔍 Checking ${emails.length} emails against thesis:`, {
      sectors: thesis.sectors,
      keywords: thesis.keywords,
      geographies: thesis.geographies,
      excludedKeywords: thesis.excludedKeywords
    });

    const matchingEmails = emails.filter(email => {
      const text = (email.subject + " " + email.content).toLowerCase();
      let matchScore = 0;

      // 🎯 Sector match - check if any sector from thesis is mentioned
      if (thesis.sectors && thesis.sectors.length > 0) {
        const hasSectorMatch = thesis.sectors.some(sector => {
          const sectorLower = sector.toLowerCase();
          return text.includes(sectorLower) || 
                 email.subject.toLowerCase().includes(sectorLower) ||
                 (email.startup?.sector && email.startup.sector.toLowerCase().includes(sectorLower));
        });
        if (hasSectorMatch) {
          matchScore++;
          console.log(`✅ Email ${email.id} matched sector: ${email.subject}`);
        }
      }

      // 🔑 Keyword match - check if any keyword from thesis is mentioned
      if (thesis.keywords && thesis.keywords.length > 0) {
        const hasKeywordMatch = thesis.keywords.some(keyword => {
          const keywordLower = keyword.toLowerCase();
          return text.includes(keywordLower) || 
                 email.subject.toLowerCase().includes(keywordLower);
        });
        if (hasKeywordMatch) {
          matchScore++;
          console.log(`✅ Email ${email.id} matched keyword: ${email.subject}`);
        }
      }

      // 🌍 Geography match - check if any geography from thesis is mentioned
      if (thesis.geographies && thesis.geographies.length > 0) {
        const hasGeoMatch = thesis.geographies.some(geo => {
          const geoLower = geo.toLowerCase();
          return text.includes(geoLower) || 
                 email.subject.toLowerCase().includes(geoLower) ||
                 (email.startup?.location && email.startup.location.toLowerCase().includes(geoLower));
        });
        if (hasGeoMatch) {
          matchScore++;
          console.log(`✅ Email ${email.id} matched geography: ${email.subject}`);
        }
      }

      // 🚫 Excluded keyword penalty - exclude if any excluded keywords found
      if (thesis.excludedKeywords && thesis.excludedKeywords.length > 0) {
        const hasExcludedMatch = thesis.excludedKeywords.some(keyword => {
          const keywordLower = keyword.toLowerCase();
          return text.includes(keywordLower) || 
                 email.subject.toLowerCase().includes(keywordLower);
        });
        if (hasExcludedMatch) {
          console.log(`❌ Email ${email.id} excluded due to excluded keyword: ${email.subject}`);
          return false; // Exclude this email completely
        }
      }

      // If investor has ANY thesis criteria defined, require at least one match
      const hasThesisCriteria = 
        (thesis.sectors && thesis.sectors.length > 0) ||
        (thesis.keywords && thesis.keywords.length > 0) ||
        (thesis.geographies && thesis.geographies.length > 0);

      // If no thesis criteria defined, count all emails as matches
      if (!hasThesisCriteria) {
        return true;
      }

      // If thesis criteria exist, require at least one match
      return matchScore > 0;
    });

    console.log(`📊 Found ${matchingEmails.length} emails matching thesis out of ${emails.length} total emails`);
    return matchingEmails.length;
  };

  // Calculate quality deal flow metrics - UPDATED to use all emails
  const qualityDealFlowMetrics = {
    thesisMatches: calculateThesisMatches(allEmails || [], thesisData || {
      sectors: [],
      stages: [],
      checkSizeMin: 0,
      checkSizeMax: 0,
      geographies: [],
      keywords: [],
      excludedKeywords: []
    }),
    totalEmails: allEmails?.length || 0,
    matchPercentage: allEmails?.length ? 
      Math.round((calculateThesisMatches(allEmails, thesisData || {
        sectors: [],
        stages: [],
        checkSizeMin: 0,
        checkSizeMax: 0,
        geographies: [],
        keywords: [],
        excludedKeywords: []
      }) / allEmails.length) * 100) : 0
  };

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

  // Handle refresh all data
  const handleRefreshAll = async () => {
    await Promise.all([
      refetchSectors(),
      refetchStats(),
      refetchStartupsData(),
      refetchLatestEmailsData(),
      refetchAllEmailsData()
    ]);
  };

  // Handle view all redirect
  const handleViewAll = () => {
    router.push('/dashboard/investor/inbox');
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
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
  }: any) => {
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

  // Helper function to get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isLoading = sectorLoading || statsLoading || startupsLoading || emailsLoading || allEmailsLoading || thesisLoading;

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
                onClick={handleRefreshAll}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isLoading ? "Refreshing..." : "Refresh All"}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Summary - col-span-5 */}
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
                      className={`${qualityDealFlowMetrics.matchPercentage >= 50 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : qualityDealFlowMetrics.matchPercentage >= 30 
                          ? 'bg-yellow-50 text-yellow-700' 
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {qualityDealFlowMetrics.matchPercentage}% match
                    </Badge>
                  </div>
                  <p className="text-4xl font-bold">{qualityDealFlowMetrics.thesisMatches}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    out of {qualityDealFlowMetrics.totalEmails} emails match your thesis
                  </p>
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

            {/* Deal Flow by Sector - col-span-7 */}
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
                          formatter={(value, entry: any, index) => (
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

          {/* What's New Today - Updated with real emails and View All button */}
          <div className="my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                What's New Today
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleViewAll}
                className="gap-2 hover:bg-blue-800 cursor-pointer"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {latestEmails && latestEmails.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {latestEmails.map((email) => (
                  <Card key={email.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(email.from)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-sm">
                          {email.from}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {email.subject}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className="bg-emerald-100 text-emerald-700 text-xs"
                          >
                            New
                          </Badge>
                          {email.attachments && email.attachments.length > 0 && (
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
                      <AvatarFallback>DS</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">DataSphere</p>
                      <p className="text-sm text-gray-500">New pitch</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
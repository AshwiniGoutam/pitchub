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
import DashboardHeader from "@/components/header";

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

interface SectorResult {
  emailId: string;
  sector: string;
  method: "keywords" | "gemini" | "error";
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

  const predictSectors = async (
    emails: Email[]
  ): Promise<{ sectors: SectorResult[]; stats: any }> => {
    const res = await fetch("/api/predict-sectors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
    });
    if (!res.ok) throw new Error("Failed to predict sectors");
    return res.json();
  };

  const { data: sectorsData, isLoading: sectorsLoading } = useQuery({
    queryKey: ["sectors"],
    queryFn: () => predictSectors(emails),
    enabled: !!emails.length,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  console.log("sectorsData", sectorsData);

  const sectors = sectorsData?.sectors;

  // Count sector occurrences
  const sectorCount = sectors?.reduce((acc, item) => {
    acc[item?.sector] = (acc[item?.sector] || 0) + 1;
    return acc;
  }, {});

  // Convert to Recharts format
  const FinalSectorData =
    sectorCount &&
    Object?.entries(sectorCount).map(([name, value]) => ({
      name,
      value,
    }));

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
  useEffect(() => {
    if (!Array.isArray(emails) || emails.length === 0) return;

    const aggregated = Object.values(
      emails.reduce((acc: any, curr: any) => {
        const sector = curr.sector || "Unknown";
        if (!acc[sector]) acc[sector] = { name: sector, value: 0 };
        acc[sector].value += 1;
        return acc;
      }, {})
    );
    setSectorData(aggregated);
  }, [emails]);

  // useEffect(() => {
  //   if (!Array.isArray(startups) || startups.length === 0) return;

  //   const aggregated = Object.values(
  //     startups.reduce((acc: any, curr: any) => {
  //       const sector = curr.sector || "Unknown";
  //       if (!acc[sector]) acc[sector] = { name: sector, value: 0 };
  //       acc[sector].value += 1;
  //       return acc;
  //     }, {})
  //   );

  //   setSectorData(aggregated);
  // }, [startups]);

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

  const fetchMarketNews = async () => {
    const res = await fetch("/api/market-data/refresh");
    const result = await res.json();
    return result.data?.categorizedNews || [];
  };

  const { data: news = [], isLoading: newsLoading } = useQuery({
    queryKey: ["dashboardNews"],
    queryFn: fetchMarketNews,
    staleTime: 10 * 60 * 1000,
  });

  const pendingEmails = emails.filter((email) => email.status === "Pending");
  const reviewedEmails = emails.filter((email) => email.status === "Under Evaluation");

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
  const COLORS = [
    "#10B981",
    "#3B82F6",
    "#EAB308",
    "#EF4444",
    "#34D399",
    "#60A5FA",
    "#FCD34D",
    "#F87171",
    "#059669"
  ];


  // ------------------ RENDER ------------------
  return (
    <>
      {thesis &&
        (!thesis.sectors?.length ||
          !thesis.stages?.length ) && (
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
          <DashboardHeader pendingEmails={pendingEmails} title={"Dashboard"} />

          {/* Main Content */}
          <main className="p-8">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Summary */}
              <Card className="lg:col-span-12 gap-2">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-orange-50 text-orange-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Pitches</p>
                    <p className="text-4xl font-bold mt-4">{emails?.length}</p>
                  </div>

                  <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Quality Deal Flow</p>
                      <Badge
                        variant="secondary"
                        className={`${stats.deals?.growth >= 0
                          ? "bg-green-700 text-green-50"
                          : "bg-red-50 text-red-700"
                          }`}
                      >
                        {stats.deals?.growth >= 0 ? "+" : ""}
                        {stats.deals?.growth ?? 0}%{" "}
                        {stats.deals?.growth >= 0 ? "↑" : "↓"}
                      </Badge>
                    </div>

                    <p className="text-4xl font-bold mt-4">
                      {stats.acceptedPitches ?? 0}
                    </p>

                    {/* <div className="mt-4 h-16">
                      <svg viewBox="0 0 200 50" className="w-full">
                        <path
                          d="M 0,25 Q 50,15 100,20 T 200,25"
                          fill="none"
                          stroke={`${stats.deals?.growth >= 0
                            ? "rgb(16 185 129)"
                            : "rgb(239 68 68)"
                            }`}
                          strokeWidth="2"
                        />
                      </svg>
                    </div> */}
                  </div>

                  <div className="bg-red-50 text-red-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Pending Pitches</p>
                    <p className="text-4xl font-bold mt-4">{pendingEmails?.length}</p>
                  </div>

                  <div className="bg-blue-50 text-blue-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Under Evaluation</p>
                    <p className="text-4xl font-bold mt-4">{reviewedEmails?.length}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Deal Flow by Sector */}
              <Card className="lg:col-span-6 w-full">
                <CardHeader>
                  <CardTitle>Deal Flow by Sector</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={FinalSectorData}
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {FinalSectorData?.map((entry, index) => (
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

              <Card className="lg:col-span-6 w-full gap-0">
                <CardHeader className="flex items-center justify-between px-5">
                  <CardTitle>Latest News</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/dashboard/investor/market-research")}
                    className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600 cursor-pointer"
                  >
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardHeader>
                {news.slice(0, 3).map((article, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (article.url) window.open(article.url, "_blank");
                    }}
                  >
                    <CardContent
                      className={`p-4 py-2 space-y-2 ${idx === news.slice(0, 3).length - 1 ? 'border-0' : 'border-b'
                        } cursor-pointer hover:bg-gray-50 transition`}
                    >
                      <Badge className="bg-green-100 text-green-800">
                        {article.source?.name || "News"}
                      </Badge>

                      <p className="font-semibold text-sm text-gray-900 line-clamp-2">
                        {article.title}
                      </p>

                      <p className="text-sm text-gray-600 line-clamp-1">
                        {article.description}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(article.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </CardContent>
                  </div>
                ))}
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
                      <CardContent className="flex items-center gap-4 py-0 box-shadow-none">
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
                              className={`${email?.status === "Contacted"
                                ? "bg-blue-200 text-blue-800"
                                : email?.status === "Under Evaluation"
                                  ? "bg-green-100 text-green-900"
                                  : email?.status === "Pending"
                                    ? "bg-slate-200 text-slate-800"
                                    : email?.status === "New"
                                      ? "bg-orange-200 text-orange-800"
                                      : email?.status === "Rejected"
                                        ? "bg-red-200 text-red-800"
                                        : ""
                                }`}
                            >
                              {email.status}
                            </Badge>
                            {email.replies?.length ? <span
                              className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full cursor-pointer ml-2"

                            >
                              {email.replies.length}
                            </span> : ""}
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


// "use client"

// import { useQuery } from "@tanstack/react-query"
// import { StatsGrid } from "@/components/stats-grid"
// import { DealsChart } from "@/components/deals-chart"
// import { MarketNews } from "@/components/market-news"
// import { LatestEmails } from "@/components/latest-emails"
// import DashboardHeader from "@/components/header"
// import { InvestorSidebar } from "@/components/investor-sidebar"

// export default function DashboardPage() {
//   const fetchDashboardData = async () => {
//     const [statsRes, emailsRes] = await Promise.all([fetch("/api/investor/stats"), fetch("/api/gmail?limit=5")])
//     const stats = await statsRes.json()
//     const emails = await emailsRes.json()
//     return { stats, emails }
//   }

//   const { data, isLoading } = useQuery({
//     queryKey: ["dashboardData"],
//     queryFn: fetchDashboardData,
//     staleTime: 5 * 60 * 1000,
//   })

//   const pendingEmails = data?.emails?.emails?.filter((e: any) => e.status === "Pending") || []

//   if (isLoading) {
//     return (
//       <div className="flex h-screen">
//         <InvestorSidebar />
//         <div className="flex-1 flex items-center justify-center bg-background">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
//             <p className="text-muted-foreground">Loading dashboard...</p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex h-screen bg-background">
//       <InvestorSidebar />
//       <main className="flex-1 overflow-auto">
//         <DashboardHeader title="Dashboard" pendingEmails={pendingEmails?.length} />
//         <div className="p-8 space-y-6 max-w-7xl">
//           <StatsGrid statsRes={data?.stats} />
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="lg:col-span-2">
//               <DealsChart />
//             </div>
//             <div>
//               <MarketNews />
//             </div>
//           </div>
//           <LatestEmails />
//         </div>
//       </main>
//     </div>
//   )
// }

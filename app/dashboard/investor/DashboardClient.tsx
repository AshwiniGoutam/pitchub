"use client";

import {
  Bell,
  Calendar,
  RefreshCw,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

// ---------------- Interfaces ----------------
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
  fundingRequirement: { min: number; max: number };
  relevanceScore: number;
  status: string;
  createdAt: string;
  description: string;
}

interface SectorData {
  sectors: Array<{ name: string; value: number; percentage: number }>;
  totalEmails: number;
  analyzedEmails: number;
}

interface Email {
  id: string;
  from: string;
  subject: string;
  content: string;
  timestamp: string;
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

interface DashboardClientProps {
  initialStats: DashboardStats;
  initialStartups: Startup[];
  initialSectorData: SectorData;
  initialLatestEmails: Email[];
  initialAllEmails: Email[];
  initialThesis: InvestorThesis;
}

// ---------------- Constants ----------------
const COLORS = ["#10B981", "#3B82F6", "#EAB308", "#EF4444", "#8B5CF6", "#F59E0B", "#EC4899"];

// ---------------- Component ----------------
export default function DashboardClient({
  initialStats,
  initialStartups,
  initialSectorData,
  initialLatestEmails,
  initialAllEmails,
  initialThesis,
}: DashboardClientProps) {
  const router = useRouter();
  const [dealFlow, setDealFlow] = useState({
    matches: 0,
    total: initialAllEmails.length,
    percent: 0,
  });

  const [filteredStartups, setFilteredStartups] = useState(initialStartups);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");

  // Lazy computation of deal flow
  useEffect(() => {
    const calcMatches = (emails: Email[], thesis: InvestorThesis) => {
      if (!emails.length || !thesis) return 0;

      return emails.filter((email) => {
        const text = (email.subject + " " + email.content).toLowerCase();
        let score = 0;

        if (thesis.sectors?.some((s) => text.includes(s.toLowerCase()))) score++;
        if (thesis.keywords?.some((k) => text.includes(k.toLowerCase()))) score++;
        if (thesis.geographies?.some((g) => text.includes(g.toLowerCase()))) score++;
        if (thesis.excludedKeywords?.some((k) => text.includes(k.toLowerCase()))) return false;

        return score > 0;
      }).length;
    };

    const matches = calcMatches(initialAllEmails, initialThesis);
    const percent = initialAllEmails.length
      ? Math.round((matches / initialAllEmails.length) * 100)
      : 0;

    setDealFlow({ matches, total: initialAllEmails.length, percent });
  }, [initialAllEmails, initialThesis]);

  // Filter startups client-side
  useEffect(() => {
    let filtered = initialStartups;
    if (searchTerm)
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (sectorFilter !== "all")
      filtered = filtered.filter((s) => s.sector === sectorFilter);
    if (stageFilter !== "all")
      filtered = filtered.filter((s) => s.stage === stageFilter);
    setFilteredStartups(filtered);
  }, [searchTerm, sectorFilter, stageFilter, initialStartups]);

  // Helpers
  const getInitials = (name: string) =>
    name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);

  const CustomTooltip = ({ active, payload }: any) =>
    active && payload?.length ? (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-bold">{payload[0].payload.name}</p>
        <p className="text-sm">
          {payload[0].payload.value} emails ({payload[0].payload.percentage}%)
        </p>
      </div>
    ) : null;

  // ---------------- JSX ----------------
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

        {/* Main */}
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
                  <p className="text-4xl font-bold">{initialStats.totalPitches}</p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Quality Deal Flow</p>
                    <Badge
                      variant="secondary"
                      className={
                        dealFlow.percent >= 50
                          ? "bg-emerald-50 text-emerald-700"
                          : dealFlow.percent >= 30
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }
                    >
                      {dealFlow.percent}% match
                    </Badge>
                  </div>
                  <p className="text-4xl font-bold">{dealFlow.matches}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    out of {dealFlow.total} emails match your thesis
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Reviewed</p>
                  <p className="text-4xl font-bold">{initialStats.underReview}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Contacted</p>
                  <p className="text-4xl font-bold">{initialStats.contacted}</p>
                </div>
              </CardContent>
            </Card>

            {/* Sector Pie */}
            <Card className="lg:col-span-7 w-full">
              <CardHeader>
                <CardTitle>
                  Deal Flow by Sector
                  {initialSectorData?.sectors?.length > 0 && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({initialSectorData.analyzedEmails} emails analyzed)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {initialSectorData?.sectors?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={initialSectorData.sectors}
                        cx="50%"
                        cy="50%"
                        outerRadius={140}
                        innerRadius={70}
                        dataKey="value"
                        nameKey="name"
                        labelLine={false}
                      >
                        {initialSectorData.sectors.map((entry, i) => (
                          <Cell
                            key={`cell-${i}`}
                            fill={COLORS[i % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <div className="text-lg mb-2">No Email Data</div>
                    <div className="text-sm mb-4">
                      {initialSectorData?.totalEmails > 0
                        ? `Found ${initialSectorData.totalEmails} emails but couldn't analyze sectors`
                        : "No pitch emails found"}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* What's New */}
          <div className="my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">What's New Today</h2>
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
            {initialLatestEmails?.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {initialLatestEmails.map((email) => (
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
  );
}

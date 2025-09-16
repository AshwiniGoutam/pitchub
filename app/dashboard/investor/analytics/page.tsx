"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  Target,
  Clock,
  DollarSign,
  Building,
  Download,
} from "lucide-react";
import { InvestorSidebar } from "@/components/investor-sidebar";

const COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/investor/analytics?timeRange=${timeRange}`
        );
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
        } else {
          // Fallback to mock data if API fails
          setAnalyticsData(getMockData());
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setAnalyticsData(getMockData());
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const getMockData = () => ({
    kpis: {
      totalDeals: 312,
      responseRate: "28.4",
      avgResponseTime: "4.2h",
      meetingConversion: "15.6",
      investmentRate: "3.8",
      portfolioSize: 47,
    },
    dealFlow: [
      { month: "Jan", received: 45, contacted: 12, meetings: 8, invested: 2 },
      { month: "Feb", received: 52, contacted: 15, meetings: 10, invested: 3 },
      { month: "Mar", received: 38, contacted: 9, meetings: 6, invested: 1 },
      { month: "Apr", received: 61, contacted: 18, meetings: 12, invested: 4 },
      { month: "May", received: 49, contacted: 14, meetings: 9, invested: 2 },
      { month: "Jun", received: 67, contacted: 21, meetings: 15, invested: 5 },
    ],
    sectors: [
      { name: "FinTech", value: 35, deals: 23 },
      { name: "HealthTech", value: 25, deals: 16 },
      { name: "EdTech", value: 20, deals: 13 },
      { name: "AgriTech", value: 12, deals: 8 },
      { name: "CleanTech", value: 8, deals: 5 },
    ],
    stages: [
      { stage: "Pre-Seed", count: 45, percentage: 35 },
      { stage: "Seed", count: 38, percentage: 30 },
      { stage: "Series A", count: 25, percentage: 20 },
      { stage: "Series B", count: 12, percentage: 10 },
      { stage: "Later Stage", count: 6, percentage: 5 },
    ],
    responseTime: [
      { day: "Mon", avgHours: 4.2 },
      { day: "Tue", avgHours: 3.8 },
      { day: "Wed", avgHours: 5.1 },
      { day: "Thu", avgHours: 3.5 },
      { day: "Fri", avgHours: 6.2 },
      { day: "Sat", avgHours: 8.1 },
      { day: "Sun", avgHours: 12.3 },
    ],
  });

  const kpiData = analyticsData
    ? [
        {
          title: "Total Deal Flow",
          value: analyticsData.kpis.totalDeals.toString(),
          change: "+12.5%",
          trend: "up",
          icon: Mail,
          description: "Pitches received this period",
        },
        {
          title: "Response Rate",
          value: `${analyticsData.kpis.responseRate}%`,
          change: "+3.2%",
          trend: "up",
          icon: Target,
          description: "Startups contacted vs received",
        },
        {
          title: "Avg Response Time",
          value: analyticsData.kpis.avgResponseTime,
          change: "-1.3h",
          trend: "up",
          icon: Clock,
          description: "Time to first response",
        },
        {
          title: "Meeting Conversion",
          value: `${analyticsData.kpis.meetingConversion}%`,
          change: "+2.1%",
          trend: "up",
          icon: Users,
          description: "Contacts to meetings ratio",
        },
        {
          title: "Investment Rate",
          value: `${analyticsData.kpis.investmentRate}%`,
          change: "+0.5%",
          trend: "up",
          icon: DollarSign,
          description: "Meetings to investments",
        },
        {
          title: "Portfolio Size",
          value: analyticsData.kpis.portfolioSize.toString(),
          change: "+5",
          trend: "up",
          icon: Building,
          description: "Active portfolio companies",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to load analytics
          </h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <InvestorSidebar />
      <div className="w-[80%] p-4 pt-10 mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive insights into your deal flow and investment activity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-gray-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card
                key={index}
                className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-cyan-100">
                      <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <Badge
                      variant={kpi.trend === "up" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {kpi.trend === "up" ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {kpi.change}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {kpi.value}
                    </h3>
                    <p className="text-sm font-medium text-gray-700">
                      {kpi.title}
                    </p>
                    <p className="text-xs text-gray-500">{kpi.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="dealflow" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-gray-200">
            <TabsTrigger
              value="dealflow"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              Deal Flow
            </TabsTrigger>
            <TabsTrigger
              value="sectors"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              Sectors
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="stages"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              Funding Stages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dealflow" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Deal Flow Funnel
                </CardTitle>
                <CardDescription>
                  Track your investment pipeline from initial contact to final
                  investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.dealFlow}>
                      <defs>
                        <linearGradient
                          id="received"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8b5cf6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="contacted"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#06b6d4"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#06b6d4"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="meetings"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="invested"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f59e0b"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f59e0b"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="received"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#received)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="contacted"
                        stroke="#06b6d4"
                        fillOpacity={1}
                        fill="url(#contacted)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="meetings"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#meetings)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="invested"
                        stroke="#f59e0b"
                        fillOpacity={1}
                        fill="url(#invested)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sectors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Sector Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of deals by industry sector
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.sectors}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analyticsData.sectors.map(
                            (entry: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Sector Details
                  </CardTitle>
                  <CardDescription>
                    Deal count and percentage by sector
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.sectors.map((sector: any, index: number) => (
                      <div
                        key={sector.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="font-medium text-gray-900">
                            {sector.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {sector.deals} deals
                          </div>
                          <div className="text-sm text-gray-500">
                            {sector.value}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Response Time Analysis
                </CardTitle>
                <CardDescription>
                  Average response time by day of the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.responseTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="avgHours"
                        fill="url(#barGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient
                          id="barGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stages" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Funding Stage Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of deals by funding stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.stages.map((stage: any, index: number) => (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">
                          {stage.stage}
                        </span>
                        <span className="text-sm text-gray-600">
                          {stage.count} deals ({stage.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                          style={{ width: `${stage.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

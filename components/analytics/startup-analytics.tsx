"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, Eye, MessageCircle, Target, Download, Users, Clock } from "lucide-react"

interface StartupAnalyticsProps {
  timeRange: "7d" | "30d" | "90d" | "1y"
  onTimeRangeChange: (range: "7d" | "30d" | "90d" | "1y") => void
}

export function StartupAnalytics({ timeRange, onTimeRangeChange }: StartupAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState("fundraising")

  // Mock data - in real app, this would come from API
  const fundraisingProgress = [
    { week: "Week 1", target: 2000000, raised: 150000, investors: 3, meetings: 5 },
    { week: "Week 2", target: 2000000, raised: 420000, investors: 7, meetings: 8 },
    { week: "Week 3", target: 2000000, raised: 680000, investors: 12, meetings: 12 },
    { week: "Week 4", target: 2000000, raised: 950000, investors: 18, meetings: 15 },
    { week: "Week 5", target: 2000000, raised: 1250000, investors: 22, meetings: 18 },
    { week: "Week 6", target: 2000000, raised: 1580000, investors: 28, meetings: 22 },
  ]

  const investorEngagement = [
    { day: "Mon", profileViews: 12, messages: 3, meetings: 1 },
    { day: "Tue", profileViews: 18, messages: 5, meetings: 2 },
    { day: "Wed", profileViews: 15, messages: 4, meetings: 1 },
    { day: "Thu", profileViews: 22, messages: 7, meetings: 3 },
    { day: "Fri", profileViews: 28, messages: 8, meetings: 2 },
    { day: "Sat", profileViews: 8, messages: 2, meetings: 0 },
    { day: "Sun", profileViews: 6, messages: 1, meetings: 0 },
  ]

  const investorTypes = [
    { name: "VCs", value: 45, color: "#10b981" },
    { name: "Angels", value: 30, color: "#3b82f6" },
    { name: "Corporate", value: 15, color: "#8b5cf6" },
    { name: "Family Office", value: 10, color: "#f59e0b" },
  ]

  const pitchPerformance = [
    { metric: "Deck Views", value: 156, change: "+23%", trend: "up" },
    { metric: "Meeting Requests", value: 28, change: "+12%", trend: "up" },
    { metric: "Follow-ups", value: 18, change: "+8%", trend: "up" },
    { metric: "Term Sheets", value: 3, change: "+200%", trend: "up" },
  ]

  const kpiCards = [
    {
      title: "Fundraising Progress",
      value: "79%",
      subtitle: "$1.58M of $2M goal",
      change: "+15%",
      trend: "up",
      icon: Target,
      description: "vs last month",
    },
    {
      title: "Investor Interest",
      value: "28",
      subtitle: "Active conversations",
      change: "+8",
      trend: "up",
      icon: Users,
      description: "new this week",
    },
    {
      title: "Avg Response Time",
      value: "4.2 hrs",
      subtitle: "To investor messages",
      change: "-1.3 hrs",
      trend: "up",
      icon: Clock,
      description: "improvement",
    },
    {
      title: "Match Score",
      value: "92%",
      subtitle: "Avg investor alignment",
      change: "+5%",
      trend: "up",
      icon: TrendingUp,
      description: "vs last week",
    },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fundraising Analytics</h2>
          <p className="text-gray-600">Track your fundraising progress and investor engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-xs text-gray-500 mb-1">{kpi.subtitle}</p>
                  <div className="flex items-center mt-1">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {kpi.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">{kpi.description}</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <kpi.icon className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fundraising">Fundraising</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="fundraising" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fundraising Progress</CardTitle>
                <CardDescription>Track your funding goal over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={fundraisingProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="#e5e7eb"
                      fill="#e5e7eb"
                      fillOpacity={0.3}
                      name="Target"
                    />
                    <Area
                      type="monotone"
                      dataKey="raised"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Raised"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investor Type Distribution</CardTitle>
                <CardDescription>Breakdown of investor interest by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={investorTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {investorTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Fundraising Metrics</CardTitle>
              <CardDescription>Track investors and meetings alongside funding progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={fundraisingProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="right" type="monotone" dataKey="investors" stroke="#10b981" name="Active Investors" />
                  <Line yAxisId="right" type="monotone" dataKey="meetings" stroke="#3b82f6" name="Meetings" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Investor Engagement</CardTitle>
              <CardDescription>Track how investors are interacting with your startup</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={investorEngagement}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="profileViews" fill="#10b981" name="Profile Views" />
                  <Bar dataKey="messages" fill="#3b82f6" name="Messages" />
                  <Bar dataKey="meetings" fill="#8b5cf6" name="Meetings" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pitchPerformance.map((metric) => (
              <Card key={metric.metric}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.metric}</p>
                      <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                      <div className="flex items-center mt-1">
                        {metric.trend === "up" ? (
                          <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                        )}
                        <span
                          className={`text-xs font-medium ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}
                        >
                          {metric.change}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 bg-emerald-100 rounded-full">
                      <Eye className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Track your fundraising conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Profile Views</span>
                    <span className="font-semibold">156</span>
                  </div>
                  <Progress value={100} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Investor Interest</span>
                    <span className="font-semibold">42 (27%)</span>
                  </div>
                  <Progress value={27} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Meeting Requests</span>
                    <span className="font-semibold">28 (18%)</span>
                  </div>
                  <Progress value={18} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Term Sheets</span>
                    <span className="font-semibold">3 (2%)</span>
                  </div>
                  <Progress value={2} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Performance Metrics</CardTitle>
                <CardDescription>Important fundraising KPIs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg Time to Response</span>
                    <span className="font-semibold">4.2 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Meeting Conversion Rate</span>
                    <span className="font-semibold">67%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg Deal Size Interest</span>
                    <span className="font-semibold">$285K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Fundraising Velocity</span>
                    <span className="font-semibold text-green-600">$263K/week</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Estimated Close Date</span>
                    <span className="font-semibold">2 weeks</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>Recommendations to improve your fundraising</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800">Strong Momentum</h4>
                        <p className="text-sm text-green-700">
                          Your fundraising velocity is 23% above average. Consider increasing your target by 15-20%.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800">Response Optimization</h4>
                        <p className="text-sm text-blue-700">
                          Investors respond 40% faster to messages sent between 9-11 AM on weekdays.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">Investor Targeting</h4>
                        <p className="text-sm text-yellow-700">
                          Focus on Series A VCs - they show 3x higher engagement with your profile.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Benchmarks</CardTitle>
                <CardDescription>How you compare to similar startups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Fundraising Speed</span>
                      <Badge className="bg-green-100 text-green-800">Above Average</Badge>
                    </div>
                    <Progress value={78} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">78th percentile for AI/ML startups</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Investor Response Rate</span>
                      <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                    </div>
                    <Progress value={92} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">92nd percentile for Series A</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Meeting Conversion</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                    </div>
                    <Progress value={65} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">65th percentile for your stage</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Term Sheet Rate</span>
                      <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                    </div>
                    <Progress value={88} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">88th percentile for B2B SaaS</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

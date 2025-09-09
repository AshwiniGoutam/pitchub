"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Clock, Download, Calendar, BarChart3 } from "lucide-react"

interface InvestorAnalyticsProps {
  timeRange: "7d" | "30d" | "90d" | "1y"
  onTimeRangeChange: (range: "7d" | "30d" | "90d" | "1y") => void
}

export function InvestorAnalytics({ timeRange, onTimeRangeChange }: InvestorAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState("overview")

  // Mock data - in real app, this would come from API
  const dealFlowData = [
    { month: "Jan", inbound: 45, reviewed: 38, meetings: 12, invested: 2 },
    { month: "Feb", inbound: 52, reviewed: 44, meetings: 15, invested: 3 },
    { month: "Mar", inbound: 38, reviewed: 32, meetings: 10, invested: 1 },
    { month: "Apr", inbound: 61, reviewed: 55, meetings: 18, invested: 4 },
    { month: "May", inbound: 48, reviewed: 41, meetings: 14, invested: 2 },
    { month: "Jun", inbound: 55, reviewed: 48, meetings: 16, invested: 3 },
  ]

  const portfolioPerformance = [
    { company: "TechFlow AI", investment: 2000000, currentValue: 4500000, multiple: 2.25, status: "Growing" },
    { company: "GreenEnergy", investment: 1500000, currentValue: 2800000, multiple: 1.87, status: "Stable" },
    { company: "HealthTrack", investment: 1000000, currentValue: 1200000, multiple: 1.2, status: "Growing" },
    { company: "DataFlow", investment: 3000000, currentValue: 5100000, multiple: 1.7, status: "Stable" },
  ]

  const sectorDistribution = [
    { name: "AI/ML", value: 35, color: "#10b981" },
    { name: "FinTech", value: 25, color: "#3b82f6" },
    { name: "HealthTech", value: 20, color: "#8b5cf6" },
    { name: "CleanTech", value: 15, color: "#f59e0b" },
    { name: "Other", value: 5, color: "#6b7280" },
  ]

  const responseMetrics = [
    { week: "Week 1", avgResponseTime: 2.4, dealsClosed: 1, meetingsScheduled: 4 },
    { week: "Week 2", avgResponseTime: 1.8, dealsClosed: 2, meetingsScheduled: 6 },
    { week: "Week 3", avgResponseTime: 2.1, dealsClosed: 0, meetingsScheduled: 3 },
    { week: "Week 4", avgResponseTime: 1.5, dealsClosed: 3, meetingsScheduled: 8 },
  ]

  const kpiCards = [
    {
      title: "Total Portfolio Value",
      value: "$13.6M",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      description: "vs last quarter",
    },
    {
      title: "Active Deals",
      value: "24",
      change: "+8",
      trend: "up",
      icon: Target,
      description: "in pipeline",
    },
    {
      title: "Avg Response Time",
      value: "1.9 days",
      change: "-0.3 days",
      trend: "up",
      icon: Clock,
      description: "vs last month",
    },
    {
      title: "Conversion Rate",
      value: "6.2%",
      change: "+1.1%",
      trend: "up",
      icon: TrendingUp,
      description: "pitch to investment",
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
          <h2 className="text-2xl font-bold text-gray-900">Investment Analytics</h2>
          <p className="text-gray-600">Track your deal flow, portfolio performance, and investment metrics</p>
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
          <TabsTrigger value="overview">Deal Flow</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reports">LP Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deal Flow Funnel</CardTitle>
                <CardDescription>Track startups through your investment process</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dealFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inbound" fill="#10b981" name="Inbound" />
                    <Bar dataKey="reviewed" fill="#3b82f6" name="Reviewed" />
                    <Bar dataKey="meetings" fill="#8b5cf6" name="Meetings" />
                    <Bar dataKey="invested" fill="#f59e0b" name="Invested" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sector Distribution</CardTitle>
                <CardDescription>Investment allocation by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sectorDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sectorDistribution.map((entry, index) => (
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
              <CardTitle>Response Time & Deal Velocity</CardTitle>
              <CardDescription>Track your responsiveness and deal closing efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgResponseTime"
                    stroke="#10b981"
                    name="Avg Response Time (days)"
                  />
                  <Line yAxisId="right" type="monotone" dataKey="dealsClosed" stroke="#3b82f6" name="Deals Closed" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="meetingsScheduled"
                    stroke="#8b5cf6"
                    name="Meetings Scheduled"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Track the performance of your portfolio companies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioPerformance.map((company) => (
                  <div key={company.company} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{company.company}</h3>
                        <p className="text-sm text-gray-600">Investment: {formatCurrency(company.investment)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(company.currentValue)}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            company.multiple >= 2
                              ? "bg-green-100 text-green-800"
                              : company.multiple >= 1.5
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {company.multiple}x
                        </Badge>
                        <Badge variant="outline">{company.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Performance Trends</CardTitle>
                <CardDescription>Portfolio value over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={[
                      { month: "Jan", value: 8500000 },
                      { month: "Feb", value: 9200000 },
                      { month: "Mar", value: 10100000 },
                      { month: "Apr", value: 11800000 },
                      { month: "May", value: 12900000 },
                      { month: "Jun", value: 13600000 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deal Success Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pitch to Meeting Rate</span>
                    <span className="font-semibold">32%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Meeting to Investment Rate</span>
                    <span className="font-semibold">18%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Deal Size</span>
                    <span className="font-semibold">$1.8M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Portfolio IRR</span>
                    <span className="font-semibold text-green-600">24.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Time to Decision</span>
                    <span className="font-semibold">12 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>LP Reporting Dashboard</CardTitle>
              <CardDescription>Generate reports for your limited partners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
                  <Calendar className="h-6 w-6 mb-2" />
                  Quarterly Report
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Portfolio Summary
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Performance Analysis
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
                  <DollarSign className="h-6 w-6 mb-2" />
                  Financial Statements
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
                  <Users className="h-6 w-6 mb-2" />
                  Deal Flow Report
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
                  <Download className="h-6 w-6 mb-2" />
                  Custom Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

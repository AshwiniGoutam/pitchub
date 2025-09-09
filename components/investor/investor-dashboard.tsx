"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Inbox,
  TrendingUp,
  Users,
  Calendar,
  Search,
  Filter,
  Eye,
  X,
  CheckCircle,
  Clock,
  Building2,
  MapPin,
  DollarSign,
  BarChart3,
} from "lucide-react"
import { InvestorNavigation } from "./investor-navigation"
import { InboxView } from "./inbox-view"
import { PortfolioView } from "./portfolio-view"
import { AnalyticsView } from "./analytics-view"

export function InvestorDashboard() {
  const [activeTab, setActiveTab] = useState("inbox")

  return (
    <div className="min-h-screen bg-background">
      <InvestorNavigation />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card h-[calc(100vh-4rem)] sticky top-16">
          <div className="p-6">
            <div className="space-y-2">
              <Button
                variant={activeTab === "inbox" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("inbox")}
              >
                <Inbox className="mr-2 h-4 w-4" />
                Smart Inbox
                <Badge variant="secondary" className="ml-auto">
                  12
                </Badge>
              </Button>
              <Button
                variant={activeTab === "portfolio" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("portfolio")}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Portfolio
              </Button>
              <Button
                variant={activeTab === "pipeline" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("pipeline")}
              >
                <Users className="mr-2 h-4 w-4" />
                Deal Pipeline
              </Button>
              <Button
                variant={activeTab === "analytics" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("analytics")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
              <Button
                variant={activeTab === "calendar" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("calendar")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "inbox" && <InboxView />}
          {activeTab === "portfolio" && <PortfolioView />}
          {activeTab === "pipeline" && <DealPipelineView />}
          {activeTab === "analytics" && <AnalyticsView />}
          {activeTab === "calendar" && <CalendarView />}
        </main>
      </div>
    </div>
  )
}

function DealPipelineView() {
  const [filterStage, setFilterStage] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const deals = [
    {
      id: 1,
      company: "TechFlow AI",
      sector: "AI/ML",
      stage: "Series A",
      amount: "$2.5M",
      location: "San Francisco",
      status: "meeting_requested",
      lastContact: "2 days ago",
      founder: "Sarah Chen",
      description: "AI-powered workflow automation for enterprises",
    },
    {
      id: 2,
      company: "GreenEnergy Solutions",
      sector: "CleanTech",
      stage: "Seed",
      amount: "$800K",
      location: "Austin",
      status: "under_review",
      lastContact: "1 week ago",
      founder: "Mike Rodriguez",
      description: "Solar panel efficiency optimization using IoT",
    },
    {
      id: 3,
      company: "HealthTrack Pro",
      sector: "HealthTech",
      stage: "Pre-Seed",
      amount: "$500K",
      location: "Boston",
      status: "viewed",
      lastContact: "3 days ago",
      founder: "Dr. Emily Watson",
      description: "Remote patient monitoring platform",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "meeting_requested":
        return "bg-primary text-primary-foreground"
      case "under_review":
        return "bg-yellow-500 text-white"
      case "viewed":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "meeting_requested":
        return "Meeting Requested"
      case "under_review":
        return "Under Review"
      case "viewed":
        return "Viewed"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-3xl">Deal Pipeline</h1>
        <Button>
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search companies, founders, or sectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="pre-seed">Pre-Seed</SelectItem>
            <SelectItem value="seed">Seed</SelectItem>
            <SelectItem value="series-a">Series A</SelectItem>
            <SelectItem value="series-b">Series B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deal Cards */}
      <div className="grid gap-4">
        {deals.map((deal) => (
          <Card key={deal.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading font-semibold text-lg">{deal.company}</h3>
                  <Badge variant="outline">{deal.sector}</Badge>
                  <Badge variant="outline">{deal.stage}</Badge>
                  <Badge className={getStatusColor(deal.status)}>{getStatusText(deal.status)}</Badge>
                </div>
                <p className="text-muted-foreground mb-3">{deal.description}</p>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {deal.amount}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {deal.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {deal.founder}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {deal.lastContact}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button size="sm" variant="outline">
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CalendarView() {
  const upcomingMeetings = [
    {
      id: 1,
      company: "TechFlow AI",
      founder: "Sarah Chen",
      time: "Today, 2:00 PM",
      type: "Pitch Meeting",
      duration: "45 min",
    },
    {
      id: 2,
      company: "HealthTrack Pro",
      founder: "Dr. Emily Watson",
      time: "Tomorrow, 10:00 AM",
      type: "Follow-up Call",
      duration: "30 min",
    },
    {
      id: 3,
      company: "GreenEnergy Solutions",
      founder: "Mike Rodriguez",
      time: "Friday, 3:30 PM",
      type: "Due Diligence",
      duration: "60 min",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-3xl">Calendar</h1>
        <Button>Schedule Meeting</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="font-heading">Upcoming Meetings</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-semibold">{meeting.company}</h4>
                  <p className="text-sm text-muted-foreground">{meeting.founder}</p>
                  <p className="text-sm text-muted-foreground">{meeting.time}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{meeting.type}</Badge>
                  <p className="text-sm text-muted-foreground mt-1">{meeting.duration}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="font-heading">This Week's Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Pitch Meetings</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between">
                <span>Follow-up Calls</span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex justify-between">
                <span>Due Diligence Sessions</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between">
                <span>Investment Committee</span>
                <span className="font-semibold">2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

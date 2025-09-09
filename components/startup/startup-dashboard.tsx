"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Target,
  MessageSquare,
  TrendingUp,
  FileText,
  Users,
  Calendar,
  DollarSign,
  Building2,
  Rocket,
} from "lucide-react"
import { StartupNavigation } from "./startup-navigation"
import { InvestorDiscovery } from "./investor-discovery"
import { FundraisingPipeline } from "./fundraising-pipeline"
import { StartupProfile } from "./startup-profile"
import { CommunicationCenter } from "./communication-center"
import { StartupAnalytics } from "./startup-analytics"

export function StartupDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      <StartupNavigation />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card h-[calc(100vh-4rem)] sticky top-16">
          <div className="p-6">
            <div className="space-y-2">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("overview")}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Overview
              </Button>
              <Button
                variant={activeTab === "profile" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("profile")}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Company Profile
              </Button>
              <Button
                variant={activeTab === "discovery" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("discovery")}
              >
                <Search className="mr-2 h-4 w-4" />
                Find Investors
              </Button>
              <Button
                variant={activeTab === "pipeline" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("pipeline")}
              >
                <Target className="mr-2 h-4 w-4" />
                Fundraising Pipeline
              </Button>
              <Button
                variant={activeTab === "communication" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("communication")}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Communications
                <Badge variant="secondary" className="ml-auto">
                  3
                </Badge>
              </Button>
              <Button
                variant={activeTab === "analytics" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("analytics")}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "overview" && <OverviewView />}
          {activeTab === "profile" && <StartupProfile />}
          {activeTab === "discovery" && <InvestorDiscovery />}
          {activeTab === "pipeline" && <FundraisingPipeline />}
          {activeTab === "communication" && <CommunicationCenter />}
          {activeTab === "analytics" && <StartupAnalytics />}
        </main>
      </div>
    </div>
  )
}

function OverviewView() {
  const recentActivity = [
    {
      id: 1,
      type: "investor_view",
      message: "Sequoia Capital viewed your pitch deck",
      time: "2 hours ago",
      status: "positive",
    },
    {
      id: 2,
      type: "meeting_scheduled",
      message: "Meeting scheduled with Andreessen Horowitz",
      time: "1 day ago",
      status: "positive",
    },
    {
      id: 3,
      type: "pitch_sent",
      message: "Pitch sent to 5 new investors",
      time: "2 days ago",
      status: "neutral",
    },
    {
      id: 4,
      type: "profile_updated",
      message: "Company profile updated with Q3 metrics",
      time: "3 days ago",
      status: "neutral",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Welcome back, TechFlow AI</h1>
          <p className="text-muted-foreground">Here's your fundraising progress overview</p>
        </div>
        <Button>
          <Rocket className="mr-2 h-4 w-4" />
          Start New Campaign
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Investors Reached</p>
              <p className="text-2xl font-bold">47</p>
              <p className="text-xs text-green-600">+12 this week</p>
            </div>
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Response Rate</p>
              <p className="text-2xl font-bold">68%</p>
              <p className="text-xs text-green-600">Above average</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Meetings Scheduled</p>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-blue-600">3 this week</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Funding Progress</p>
              <p className="text-2xl font-bold">$800K</p>
              <p className="text-xs text-purple-600">32% of $2.5M goal</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="font-heading">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.status === "positive" ? "bg-green-500" : "bg-blue-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="font-heading">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-3">
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Update Pitch Deck
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Find New Investors
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Follow-up Messages
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Update Company Metrics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Fundraising Progress */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="font-heading">Fundraising Progress</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Series A Round Progress</span>
              <span className="text-sm text-muted-foreground">$800K / $2.5M (32%)</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div className="bg-primary h-3 rounded-full" style={{ width: "32%" }}></div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-sm text-muted-foreground">Interested Investors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">5</div>
                <div className="text-sm text-muted-foreground">Term Sheets Expected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">45</div>
                <div className="text-sm text-muted-foreground">Days to Close</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

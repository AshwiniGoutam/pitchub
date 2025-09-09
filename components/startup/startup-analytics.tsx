"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, MessageSquare, Target, Calendar } from "lucide-react"

export function StartupAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your fundraising performance and investor engagement</p>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Fundraising Progress</p>
              <p className="text-2xl font-bold">32%</p>
              <p className="text-xs text-green-600">$800K of $2.5M goal</p>
            </div>
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Investor Response Rate</p>
              <p className="text-2xl font-bold">68%</p>
              <p className="text-xs text-green-600">Above industry avg</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Conversations</p>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-blue-600">3 new this week</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Days to Close</p>
              <p className="text-2xl font-bold">45</p>
              <p className="text-xs text-purple-600">Estimated timeline</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="font-heading">Investor Engagement</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Pitch Deck Views</span>
                <span className="text-sm font-medium">47 views</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Meeting Requests</span>
                <span className="text-sm font-medium">12 requests</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Follow-up Messages</span>
                <span className="text-sm font-medium">23 messages</span>
              </div>
              <Progress value={62} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Due Diligence Requests</span>
                <span className="text-sm font-medium">5 requests</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="font-heading">Investor Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">VC Funds</span>
                <span className="text-sm font-medium">65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Angel Investors</span>
                <span className="text-sm font-medium">25%</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Corporate VCs</span>
                <span className="text-sm font-medium">8%</span>
              </div>
              <Progress value={8} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Family Offices</span>
                <span className="text-sm font-medium">2%</span>
              </div>
              <Progress value={2} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="font-heading">Monthly Performance Summary</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Outreach Activity</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Investors Contacted</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pitch Decks Sent</span>
                  <span className="font-medium">32</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Follow-ups Sent</span>
                  <span className="font-medium">23</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Engagement Results</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Responses Received</span>
                  <span className="font-medium">32</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Meetings Scheduled</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Due Diligence Started</span>
                  <span className="font-medium">5</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Funding Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Term Sheets Received</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Commitments Secured</span>
                  <span className="font-medium">$800K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pipeline Value</span>
                  <span className="font-medium">$5.3M</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

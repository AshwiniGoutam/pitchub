"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, CheckCircle, Clock, Target } from "lucide-react"

export function AnalyticsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your investment activity and performance metrics</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Response Rate</p>
              <p className="text-2xl font-bold">85%</p>
              <p className="text-xs text-green-600">+12% from last month</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Relevant Pitches</p>
              <p className="text-2xl font-bold">78%</p>
              <p className="text-xs text-blue-600">AI matching accuracy</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Time Saved</p>
              <p className="text-2xl font-bold">24h</p>
              <p className="text-xs text-purple-600">Per week</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Portfolio IRR</p>
              <p className="text-2xl font-bold">32%</p>
              <p className="text-xs text-green-600">Above target</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="font-heading">Deal Flow Analysis</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">AI/ML Startups</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">FinTech</span>
                <span className="text-sm font-medium">25%</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">HealthTech</span>
                <span className="text-sm font-medium">20%</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">CleanTech</span>
                <span className="text-sm font-medium">10%</span>
              </div>
              <Progress value={10} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="font-heading">Investment Stage Distribution</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Seed Stage</span>
                <span className="text-sm font-medium">50%</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Series A</span>
                <span className="text-sm font-medium">30%</span>
              </div>
              <Progress value={30} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Pre-Seed</span>
                <span className="text-sm font-medium">15%</span>
              </div>
              <Progress value={15} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Series B+</span>
                <span className="text-sm font-medium">5%</span>
              </div>
              <Progress value={5} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Activity */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="font-heading">Monthly Activity Summary</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Deal Flow</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Pitches Received</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Relevant Matches</span>
                  <span className="font-medium">122</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Meetings Scheduled</span>
                  <span className="font-medium">28</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Investment Activity</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Due Diligence</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Term Sheets</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Investments Made</span>
                  <span className="font-medium">2</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Portfolio Updates</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Company Updates</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Board Meetings</span>
                  <span className="font-medium">6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Follow-up Rounds</span>
                  <span className="font-medium">2</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

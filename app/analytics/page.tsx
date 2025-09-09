"use client"

import { useState } from "react"
import { InvestorAnalytics } from "@/components/analytics/investor-analytics"
import { StartupAnalytics } from "@/components/analytics/startup-analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, Target } from "lucide-react"
import { StartupNavigation } from "@/components/startup/startup-navigation"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")
  const [userType, setUserType] = useState<"investor" | "startup">("startup")

  return (
    <div className="min-h-screen bg-gray-50">
      <StartupNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-emerald-600" />
                Analytics & Reporting
              </h1>
              <p className="text-gray-600">
                Comprehensive insights into your {userType === "investor" ? "investment" : "fundraising"} performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant={userType === "startup" ? "default" : "outline"} onClick={() => setUserType("startup")}>
                Startup View
              </Button>
              <Button variant={userType === "investor" ? "default" : "outline"} onClick={() => setUserType("investor")}>
                Investor View
              </Button>
            </div>
          </div>
        </div>

        {userType === "investor" ? (
          <InvestorAnalytics timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        ) : (
          <StartupAnalytics timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        )}

        {/* Platform Overview */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Platform Impact
              </CardTitle>
              <CardDescription>How PITCHUB is transforming startup-investor connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="p-4 bg-emerald-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">2,847</h3>
                  <p className="text-gray-600">Successful Matches</p>
                  <p className="text-sm text-green-600 font-medium">+34% this month</p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">$1.2B</h3>
                  <p className="text-gray-600">Total Funding Facilitated</p>
                  <p className="text-sm text-green-600 font-medium">+67% this quarter</p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">4.2x</h3>
                  <p className="text-gray-600">Faster Deal Closure</p>
                  <p className="text-sm text-green-600 font-medium">vs traditional methods</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

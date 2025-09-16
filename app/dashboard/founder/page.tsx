"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, Users, Clock, Eye } from "lucide-react"
import { FounderSidebar } from "@/components/founder-sidebar"
import { StatsCard } from "@/components/stats-card"
import Link from "next/link"

interface FounderStats {
  totalSubmissions: number
  underReview: number
  contacted: number
  averageScore: number
}

interface Submission {
  _id: string
  name: string
  sector: string
  stage: string
  relevanceScore: number
  status: string
  createdAt: string
  investorResponses: number
}

export default function FounderDashboard() {
  const [stats, setStats] = useState<FounderStats>({
    totalSubmissions: 0,
    underReview: 0,
    contacted: 0,
    averageScore: 0,
  })
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, submissionsResponse] = await Promise.all([
        fetch("/api/founder/stats"),
        fetch("/api/founder/submissions"),
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "under_review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "contacted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <FounderSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <FounderSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Founder Dashboard</h1>
              <p className="text-muted-foreground">Track your pitch submissions and investor responses</p>
            </div>
            <Link href="/dashboard/founder/submit">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Submit New Pitch
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Submissions"
              value={stats.totalSubmissions}
              icon={<TrendingUp className="h-4 w-4" />}
              trend="All time submissions"
            />
            <StatsCard
              title="Under Review"
              value={stats.underReview}
              icon={<Clock className="h-4 w-4" />}
              trend="Being evaluated"
            />
            <StatsCard
              title="Investor Responses"
              value={stats.contacted}
              icon={<Users className="h-4 w-4" />}
              trend="Positive responses"
            />
            <StatsCard
              title="Average Match Score"
              value={Math.round(stats.averageScore)}
              icon={<TrendingUp className="h-4 w-4" />}
              trend="Relevance to investors"
            />
          </div>

          {/* Recent Submissions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Your Submissions</h2>
              {submissions.length === 0 && (
                <Link href="/dashboard/founder/submit">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Your First Pitch
                  </Button>
                </Link>
              )}
            </div>

            {submissions.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Submit your startup pitch to connect with relevant investors.
                    </p>
                    <Link href="/dashboard/founder/submit">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Submit Your Pitch
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {submissions.map((submission) => (
                  <Card key={submission._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">{submission.name}</CardTitle>
                            <Badge variant="outline" className={getStatusColor(submission.status)}>
                              {submission.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Badge variant="secondary">{submission.sector}</Badge>
                            <Badge variant="outline">{submission.stage}</Badge>
                            <span className={getRelevanceColor(submission.relevanceScore)}>
                              {submission.relevanceScore}% match
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>Submitted {new Date(submission.createdAt).toLocaleDateString()}</p>
                          <p>{submission.investorResponses} investor responses</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit Submission
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

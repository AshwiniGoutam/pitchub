"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, MessageCircle, Calendar, Target, Zap } from "lucide-react"

interface MatchData {
  id: string
  name: string
  type: "investor" | "startup"
  matchScore: number
  avatar: string
  description: string
  tags: string[]
  lastActive: string
  status: "new" | "contacted" | "meeting" | "passed"
}

interface AIMatchingEngineProps {
  userType: "investor" | "startup"
}

export function AIMatchingEngine({ userType }: AIMatchingEngineProps) {
  const [matches, setMatches] = useState<MatchData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null)

  useEffect(() => {
    // Simulate AI matching algorithm
    setTimeout(() => {
      const mockMatches: MatchData[] =
        userType === "investor"
          ? [
              {
                id: "1",
                name: "TechFlow AI",
                type: "startup",
                matchScore: 94,
                avatar: "/tech-startup-logo.png",
                description: "AI-powered workflow automation for enterprises",
                tags: ["AI/ML", "B2B SaaS", "Series A"],
                lastActive: "2 hours ago",
                status: "new",
              },
              {
                id: "2",
                name: "GreenEnergy Solutions",
                type: "startup",
                matchScore: 87,
                avatar: "/green-energy-logo.png",
                description: "Renewable energy storage solutions",
                tags: ["CleanTech", "Hardware", "Seed"],
                lastActive: "1 day ago",
                status: "contacted",
              },
              {
                id: "3",
                name: "HealthTrack Pro",
                type: "startup",
                matchScore: 82,
                avatar: "/health-tech-logo.png",
                description: "Digital health monitoring platform",
                tags: ["HealthTech", "B2C", "Pre-Seed"],
                lastActive: "3 hours ago",
                status: "new",
              },
            ]
          : [
              {
                id: "1",
                name: "Sequoia Capital",
                type: "investor",
                matchScore: 96,
                avatar: "/sequoia-capital-logo.jpg",
                description: "Leading VC firm focused on technology startups",
                tags: ["Series A-C", "Tech", "$10M-50M"],
                lastActive: "1 hour ago",
                status: "new",
              },
              {
                id: "2",
                name: "Andreessen Horowitz",
                type: "investor",
                matchScore: 91,
                avatar: "/a16z-logo.jpg",
                description: "Venture capital firm investing in bold entrepreneurs",
                tags: ["Seed-Series B", "AI/ML", "$1M-25M"],
                lastActive: "4 hours ago",
                status: "contacted",
              },
              {
                id: "3",
                name: "Kleiner Perkins",
                type: "investor",
                matchScore: 88,
                avatar: "/kleiner-perkins-logo.jpg",
                description: "Venture capital firm partnering with entrepreneurs",
                tags: ["Early Stage", "Enterprise", "$2M-15M"],
                lastActive: "2 days ago",
                status: "meeting",
              },
            ]
      setMatches(mockMatches)
      setLoading(false)
    }, 1500)
  }, [userType])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "contacted":
        return "bg-yellow-100 text-yellow-800"
      case "meeting":
        return "bg-green-100 text-green-800"
      case "passed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleConnect = (match: MatchData) => {
    setSelectedMatch(match)
    // This would open the communication interface
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-emerald-600" />
            AI Matching Engine
          </CardTitle>
          <CardDescription>Finding your perfect matches...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-emerald-600" />
            AI Matching Engine
          </CardTitle>
          <CardDescription>
            {userType === "investor"
              ? "Discover startups that match your investment thesis"
              : "Find investors aligned with your startup's vision"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="matches" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matches">Top Matches</TabsTrigger>
              <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="space-y-4">
              {matches.map((match) => (
                <Card key={match.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={match.avatar || "/placeholder.svg"} alt={match.name} />
                          <AvatarFallback>{match.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">{match.name}</h3>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4 text-emerald-600" />
                                <span className="font-bold text-emerald-600">{match.matchScore}%</span>
                              </div>
                              <Badge className={getStatusColor(match.status)}>{match.status}</Badge>
                            </div>
                          </div>

                          <p className="text-gray-600">{match.description}</p>

                          <div className="flex flex-wrap gap-2">
                            {match.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-sm text-gray-500">Active {match.lastActive}</span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleConnect(match)}>
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Connect
                              </Button>
                              <Button size="sm" onClick={() => handleConnect(match)}>
                                <Calendar className="h-4 w-4 mr-1" />
                                Schedule
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Match Score</span>
                        <span>{match.matchScore}%</span>
                      </div>
                      <Progress value={match.matchScore} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="algorithm" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-600" />
                    How Our AI Works
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <div>
                        <strong>Investment Thesis Alignment:</strong> Analyzes sector preferences, stage focus, and
                        investment criteria
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <div>
                        <strong>Traction Matching:</strong> Evaluates startup metrics against investor requirements
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <div>
                        <strong>Behavioral Patterns:</strong> Learns from past interactions and successful matches
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <div>
                        <strong>Market Dynamics:</strong> Considers current market conditions and trends
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Matching Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Minimum Match Score</label>
                      <Progress value={75} className="h-2 mt-1" />
                      <span className="text-xs text-gray-500">75%</span>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Preferred Sectors</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">AI/ML</Badge>
                        <Badge variant="outline">FinTech</Badge>
                        <Badge variant="outline">HealthTech</Badge>
                      </div>
                    </div>
                    <Button className="w-full">Update Preferences</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

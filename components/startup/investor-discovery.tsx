"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Star,
  Building2,
  MapPin,
  DollarSign,
  Target,
  Send,
  Bookmark,
  ExternalLink,
  TrendingUp,
} from "lucide-react"

export function InvestorDiscovery() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSector, setFilterSector] = useState("all")
  const [filterStage, setFilterStage] = useState("all")

  const investors = [
    {
      id: 1,
      name: "Sequoia Capital",
      type: "VC Fund",
      location: "Menlo Park, CA",
      matchScore: 95,
      sectors: ["AI/ML", "Enterprise SaaS", "Consumer"],
      stages: ["Series A", "Series B", "Series C"],
      ticketSize: "$5M - $50M",
      portfolioSize: "500+ companies",
      description: "Leading venture capital firm focused on technology companies across all stages.",
      recentInvestments: ["OpenAI", "Stripe", "Airbnb"],
      responseRate: "85%",
      avgResponseTime: "3 days",
      status: "not_contacted",
    },
    {
      id: 2,
      name: "Andreessen Horowitz",
      type: "VC Fund",
      location: "Menlo Park, CA",
      matchScore: 92,
      sectors: ["AI/ML", "Crypto", "Enterprise"],
      stages: ["Seed", "Series A", "Series B"],
      ticketSize: "$1M - $25M",
      portfolioSize: "400+ companies",
      description: "Venture capital firm investing in bold entrepreneurs building the future.",
      recentInvestments: ["Coinbase", "GitHub", "Slack"],
      responseRate: "78%",
      avgResponseTime: "2 days",
      status: "contacted",
    },
    {
      id: 3,
      name: "Bessemer Venture Partners",
      type: "VC Fund",
      location: "San Francisco, CA",
      matchScore: 88,
      sectors: ["Enterprise SaaS", "AI/ML", "HealthTech"],
      stages: ["Series A", "Series B"],
      ticketSize: "$3M - $30M",
      portfolioSize: "200+ companies",
      description: "Multi-stage venture capital firm with a focus on enterprise software.",
      recentInvestments: ["Shopify", "Twilio", "LinkedIn"],
      responseRate: "72%",
      avgResponseTime: "4 days",
      status: "meeting_scheduled",
    },
  ]

  const getMatchColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "meeting_scheduled":
        return "bg-green-100 text-green-800"
      case "contacted":
        return "bg-blue-100 text-blue-800"
      case "not_contacted":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "meeting_scheduled":
        return "Meeting Scheduled"
      case "contacted":
        return "Contacted"
      case "not_contacted":
        return "Not Contacted"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Find Investors</h1>
          <p className="text-muted-foreground">Discover investors that match your startup profile</p>
        </div>
        <Button>
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
        </Button>
      </div>

      {/* AI Matching Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Matches</p>
              <p className="text-2xl font-bold">127</p>
            </div>
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">High Match (90%+)</p>
              <p className="text-2xl font-bold">23</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Star className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Contacted</p>
              <p className="text-2xl font-bold">47</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Send className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Response Rate</p>
              <p className="text-2xl font-bold">68%</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search investors by name, focus, or portfolio companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterSector} onValueChange={setFilterSector}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            <SelectItem value="ai-ml">AI/ML</SelectItem>
            <SelectItem value="enterprise">Enterprise SaaS</SelectItem>
            <SelectItem value="fintech">FinTech</SelectItem>
            <SelectItem value="healthtech">HealthTech</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="seed">Seed</SelectItem>
            <SelectItem value="series-a">Series A</SelectItem>
            <SelectItem value="series-b">Series B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Investor Cards */}
      <div className="space-y-4">
        {investors.map((investor) => (
          <Card key={investor.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-heading font-semibold text-lg">{investor.name}</h3>
                  <Badge variant="outline">{investor.type}</Badge>
                  <Badge className={getStatusColor(investor.status)}>{getStatusText(investor.status)}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className={`h-4 w-4 ${getMatchColor(investor.matchScore)}`} />
                    <span className={`text-sm font-medium ${getMatchColor(investor.matchScore)}`}>
                      {investor.matchScore}% match
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">{investor.description}</p>

                <div className="grid md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Investment Focus</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {investor.sectors.map((sector, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {sector}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {investor.stages.map((stage, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {stage}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Investment Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{investor.ticketSize}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>{investor.portfolioSize}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{investor.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Response Metrics</h4>
                    <div className="space-y-1 text-sm">
                      <div>Response Rate: {investor.responseRate}</div>
                      <div>Avg Response: {investor.avgResponseTime}</div>
                      <div className="text-xs text-muted-foreground">
                        Recent: {investor.recentInvestments.slice(0, 2).join(", ")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Bookmark className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Profile
                </Button>
                <Button size="sm">
                  <Send className="h-4 w-4 mr-1" />
                  Send Pitch
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

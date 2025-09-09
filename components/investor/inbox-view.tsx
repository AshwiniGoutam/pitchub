"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, X, CheckCircle, Calendar, Building2, MapPin, DollarSign, Star, Clock } from "lucide-react"

export function InboxView() {
  const [filterSector, setFilterSector] = useState("all")
  const [filterStage, setFilterStage] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const pitches = [
    {
      id: 1,
      company: "TechFlow AI",
      founder: "Sarah Chen",
      sector: "AI/ML",
      stage: "Series A",
      amount: "$2.5M",
      location: "San Francisco",
      receivedDate: "2 hours ago",
      relevanceScore: 95,
      description: "AI-powered workflow automation platform for enterprise teams",
      highlights: ["YC Alumni", "40% MoM Growth", "Fortune 500 Clients"],
      status: "unread",
    },
    {
      id: 2,
      company: "GreenEnergy Solutions",
      founder: "Mike Rodriguez",
      sector: "CleanTech",
      stage: "Seed",
      amount: "$800K",
      location: "Austin",
      receivedDate: "1 day ago",
      relevanceScore: 88,
      description: "Solar panel efficiency optimization using IoT sensors and ML",
      highlights: ["Patent Pending", "B2B SaaS", "Pilot with Tesla"],
      status: "read",
    },
    {
      id: 3,
      company: "HealthTrack Pro",
      founder: "Dr. Emily Watson",
      sector: "HealthTech",
      stage: "Pre-Seed",
      amount: "$500K",
      location: "Boston",
      receivedDate: "3 days ago",
      relevanceScore: 82,
      description: "Remote patient monitoring platform for chronic disease management",
      highlights: ["FDA Approved", "Hospital Partnerships", "Clinical Trials"],
      status: "read",
    },
  ]

  const getRelevanceColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Smart Inbox</h1>
          <p className="text-muted-foreground">AI-curated pitches aligned with your investment thesis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button>Mark All as Read</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unread Pitches</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Eye className="h-4 w-4 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">High Relevance</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Star className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Response Rate</p>
              <p className="text-2xl font-bold">85%</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search companies, founders, or keywords..."
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
            <SelectItem value="fintech">FinTech</SelectItem>
            <SelectItem value="healthtech">HealthTech</SelectItem>
            <SelectItem value="cleantech">CleanTech</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="pre-seed">Pre-Seed</SelectItem>
            <SelectItem value="seed">Seed</SelectItem>
            <SelectItem value="series-a">Series A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pitch Cards */}
      <div className="space-y-4">
        {pitches.map((pitch) => (
          <Card
            key={pitch.id}
            className={`p-6 hover:shadow-md transition-shadow ${
              pitch.status === "unread" ? "border-l-4 border-l-primary" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading font-semibold text-lg">{pitch.company}</h3>
                  {pitch.status === "unread" && <Badge variant="default">New</Badge>}
                  <Badge variant="outline">{pitch.sector}</Badge>
                  <Badge variant="outline">{pitch.stage}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className={`h-4 w-4 ${getRelevanceColor(pitch.relevanceScore)}`} />
                    <span className={`text-sm font-medium ${getRelevanceColor(pitch.relevanceScore)}`}>
                      {pitch.relevanceScore}% match
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground mb-3">{pitch.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {pitch.highlights.map((highlight, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {highlight}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {pitch.founder}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {pitch.amount}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {pitch.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {pitch.receivedDate}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  View Pitch
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule
                </Button>
                <Button size="sm" variant="outline">
                  <X className="h-4 w-4 mr-1" />
                  Pass
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

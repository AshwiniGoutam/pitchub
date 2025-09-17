"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MapPin, DollarSign, Calendar, Star, MoreHorizontal, Mail, Eye, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Startup {
  _id: string
  name: string
  sector: string
  stage: string
  location: string
  fundingRequirement: {
    min: number
    max: number
  }
  relevanceScore: number
  status: string
  createdAt: string
  description: string
}

interface DealCardProps {
  startup: Startup
  onStatusUpdate: (startupId: string, newStatus: string) => void
}

export function DealCard({ startup, onStatusUpdate }: DealCardProps) {
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

  const getRelevanceBadge = (score: number) => {
    if (score >= 80) {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 gap-1">
          <Sparkles className="h-3 w-3" />
          {score}% match
        </Badge>
      )
    }
    if (score >= 60) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">{score}% match</Badge>
      )
    }
    return (
      <Badge variant="outline" className="border-red-200 text-red-600 dark:border-red-800 dark:text-red-400">
        {score}% match
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="group relative overflow-hidden border-2 border-slate-200/50 bg-white">
      {startup.relevanceScore >= 80 && (
        <div className="absolute inset-0 bg-[#fff] pointer-events-none" />
      )}

      <CardHeader className="relative pb-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                {startup.name}
              </h3>
              <Badge variant="outline" className={cn("font-medium capitalize", getStatusColor(startup.status))}>
                {startup.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium">
                {startup.sector}
              </Badge>
              <Badge variant="outline" className="font-medium">
                {startup.stage}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                {getRelevanceBadge(startup.relevanceScore)}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onStatusUpdate(startup._id, "under_review")}>
                <Eye className="h-4 w-4 mr-2" />
                Mark as Under Review
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusUpdate(startup._id, "contacted")}>
                <Mail className="h-4 w-4 mr-2" />
                Mark as Contacted
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusUpdate(startup._id, "rejected")}
                className="text-red-600 dark:text-red-400"
              >
                Mark as Rejected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <p className="text-muted-foreground mb-2 line-clamp-2 leading-relaxed">{startup.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium">{startup.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="font-medium">
              {formatCurrency(startup.fundingRequirement.min)} - {formatCurrency(startup.fundingRequirement.max)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-medium">{formatDate(startup.createdAt)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            size="sm"
            onClick={() => onStatusUpdate(startup._id, "contacted")}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
          >
            <Mail className="h-4 w-4 mr-2" />
            Mail Founder
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-2 bg-transparent"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

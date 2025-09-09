"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, MessageSquare, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"

export function FundraisingPipeline() {
  const pipelineStages = [
    { name: "Initial Contact", count: 47, color: "bg-blue-500" },
    { name: "Pitch Sent", count: 32, color: "bg-yellow-500" },
    { name: "Meeting Scheduled", count: 12, color: "bg-purple-500" },
    { name: "Due Diligence", count: 5, color: "bg-orange-500" },
    { name: "Term Sheet", count: 2, color: "bg-green-500" },
  ]

  const activeDeals = [
    {
      id: 1,
      investor: "Sequoia Capital",
      stage: "Due Diligence",
      amount: "$1.5M",
      probability: 75,
      nextAction: "Send financial model",
      dueDate: "Tomorrow",
      status: "on_track",
      lastContact: "2 days ago",
      notes: "Positive feedback on product demo. Requesting detailed financials.",
    },
    {
      id: 2,
      investor: "Andreessen Horowitz",
      stage: "Meeting Scheduled",
      amount: "$2M",
      probability: 60,
      nextAction: "Prepare pitch presentation",
      dueDate: "Friday",
      status: "on_track",
      lastContact: "1 week ago",
      notes: "Initial call went well. Partner meeting scheduled for Friday.",
    },
    {
      id: 3,
      investor: "Bessemer Venture Partners",
      stage: "Term Sheet",
      amount: "$1.8M",
      probability: 90,
      nextAction: "Review term sheet",
      dueDate: "Next week",
      status: "urgent",
      lastContact: "Yesterday",
      notes: "Term sheet received. Need to review valuation and board composition.",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_track":
        return "text-green-600"
      case "urgent":
        return "text-red-600"
      case "delayed":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "on_track":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "delayed":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Fundraising Pipeline</h1>
          <p className="text-muted-foreground">Track your investor conversations and deal progress</p>
        </div>
        <Button>Add New Investor</Button>
      </div>

      {/* Pipeline Overview */}
      <Card className="p-6">
        <h3 className="font-heading font-semibold text-lg mb-4">Pipeline Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {pipelineStages.map((stage, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 ${stage.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <span className="text-white font-bold text-lg">{stage.count}</span>
              </div>
              <h4 className="font-semibold text-sm">{stage.name}</h4>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Pipeline Progress</span>
            <span>$5.3M potential / $2.5M goal</span>
          </div>
          <Progress value={68} className="h-3" />
        </div>
      </Card>

      {/* Active Deals */}
      <div className="space-y-4">
        <h2 className="font-heading font-semibold text-xl">Active Deals</h2>
        {activeDeals.map((deal) => (
          <Card key={deal.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-heading font-semibold text-lg">{deal.investor}</h3>
                  <Badge variant="outline">{deal.stage}</Badge>
                  <Badge variant="secondary">{deal.amount}</Badge>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(deal.status)}
                    <span className={`text-sm font-medium ${getStatusColor(deal.status)}`}>
                      {deal.probability}% probability
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">{deal.notes}</p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Next Action</h4>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">{deal.nextAction}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Due Date</h4>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm">{deal.dueDate}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Last Contact</h4>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="text-sm">{deal.lastContact}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Message
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule
                </Button>
                <Button size="sm">Update Status</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

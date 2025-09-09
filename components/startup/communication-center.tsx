"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, Reply, Clock, CheckCircle, AlertCircle } from "lucide-react"

export function CommunicationCenter() {
  const conversations = [
    {
      id: 1,
      investor: "Sequoia Capital",
      lastMessage: "Thanks for the financial model. We'd like to schedule a follow-up call.",
      timestamp: "2 hours ago",
      status: "unread",
      messageCount: 8,
      priority: "high",
    },
    {
      id: 2,
      investor: "Andreessen Horowitz",
      lastMessage: "Looking forward to our meeting on Friday. Please send the agenda.",
      timestamp: "1 day ago",
      status: "read",
      messageCount: 5,
      priority: "medium",
    },
    {
      id: 3,
      investor: "Bessemer Venture Partners",
      lastMessage: "We've reviewed your term sheet response. Let's discuss the board composition.",
      timestamp: "3 days ago",
      status: "replied",
      messageCount: 12,
      priority: "high",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread":
        return "bg-red-100 text-red-800"
      case "read":
        return "bg-yellow-100 text-yellow-800"
      case "replied":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "unread":
        return <AlertCircle className="h-4 w-4" />
      case "read":
        return <Clock className="h-4 w-4" />
      case "replied":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Communications</h1>
          <p className="text-muted-foreground">Manage all investor conversations in one place</p>
        </div>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unread Messages</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Conversations</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
              <p className="text-2xl font-bold">4h</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Follow-ups Due</p>
              <p className="text-2xl font-bold">2</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Reply className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Conversation List */}
        <Card className="p-6">
          <h3 className="font-heading font-semibold text-lg mb-4">Recent Conversations</h3>
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-l-4 ${getPriorityColor(
                  conversation.priority,
                )} border border-border rounded-lg hover:shadow-sm transition-shadow cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{conversation.investor}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(conversation.status)} variant="secondary">
                      <span className="flex items-center gap-1">
                        {getStatusIcon(conversation.status)}
                        {conversation.status}
                      </span>
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{conversation.lastMessage}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{conversation.messageCount} messages</span>
                  <span>{conversation.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Reply */}
        <Card className="p-6">
          <h3 className="font-heading font-semibold text-lg mb-4">Quick Reply</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">To:</label>
              <Input placeholder="Select investor..." className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Subject:</label>
              <Input placeholder="Message subject..." className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Message:</label>
              <Textarea placeholder="Type your message..." rows={6} className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <Button variant="outline">Save Draft</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Message Templates */}
      <Card className="p-6">
        <h3 className="font-heading font-semibold text-lg mb-4">Message Templates</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-lg hover:shadow-sm transition-shadow cursor-pointer">
            <h4 className="font-semibold mb-2">Follow-up After Meeting</h4>
            <p className="text-sm text-muted-foreground">Thank you for taking the time to meet with us yesterday...</p>
          </div>
          <div className="p-4 border border-border rounded-lg hover:shadow-sm transition-shadow cursor-pointer">
            <h4 className="font-semibold mb-2">Investor Update</h4>
            <p className="text-sm text-muted-foreground">
              I wanted to share some exciting updates about our progress...
            </p>
          </div>
          <div className="p-4 border border-border rounded-lg hover:shadow-sm transition-shadow cursor-pointer">
            <h4 className="font-semibold mb-2">Due Diligence Response</h4>
            <p className="text-sm text-muted-foreground">
              Thank you for your interest in our company. Please find attached...
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

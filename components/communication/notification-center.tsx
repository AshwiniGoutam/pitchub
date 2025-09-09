"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, MessageCircle, Calendar, TrendingUp, Users, CheckCircle, X, Settings } from "lucide-react"

interface Notification {
  id: string
  type: "message" | "meeting" | "match" | "update" | "system"
  title: string
  description: string
  timestamp: Date
  isRead: boolean
  actionUrl?: string
  avatar?: string
  priority: "low" | "medium" | "high"
}

interface NotificationCenterProps {
  userType: "investor" | "startup"
}

export function NotificationCenter({ userType }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "important">("all")

  useEffect(() => {
    // Mock notifications data
    setTimeout(() => {
      const mockNotifications: Notification[] =
        userType === "investor"
          ? [
              {
                id: "1",
                type: "match",
                title: "New High-Quality Match",
                description: "TechFlow AI (94% match) has been added to your pipeline",
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                isRead: false,
                avatar: "/tech-startup-office.png",
                priority: "high",
              },
              {
                id: "2",
                type: "message",
                title: "New Message from GreenEnergy Solutions",
                description: "Thanks for your interest! I'd love to discuss our Series A round.",
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                isRead: false,
                avatar: "/green-energy-landscape.png",
                priority: "medium",
              },
              {
                id: "3",
                type: "meeting",
                title: "Meeting Reminder",
                description: "Pitch meeting with HealthTrack Pro in 1 hour",
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                isRead: true,
                avatar: "/health-tech-devices.png",
                priority: "high",
              },
              {
                id: "4",
                type: "update",
                title: "Portfolio Update",
                description: "DataFlow Inc. has reached 100K ARR milestone",
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                isRead: true,
                priority: "medium",
              },
              {
                id: "5",
                type: "system",
                title: "Weekly Deal Flow Report",
                description: "Your weekly summary: 12 new matches, 5 meetings scheduled",
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                isRead: true,
                priority: "low",
              },
            ]
          : [
              {
                id: "1",
                type: "match",
                title: "Perfect Investor Match Found!",
                description: "Sequoia Capital (96% match) is interested in your sector",
                timestamp: new Date(Date.now() - 45 * 60 * 1000),
                isRead: false,
                avatar: "/sequoia-capital.jpg",
                priority: "high",
              },
              {
                id: "2",
                type: "message",
                title: "Message from Sarah Chen",
                description: "I'd like to schedule a follow-up call to discuss your traction metrics.",
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
                isRead: false,
                avatar: "/investor-woman.jpg",
                priority: "high",
              },
              {
                id: "3",
                type: "meeting",
                title: "Meeting Confirmed",
                description: "Pitch meeting with Andreessen Horowitz scheduled for tomorrow",
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
                isRead: true,
                avatar: "/a16z-logo-abstract.png",
                priority: "high",
              },
              {
                id: "4",
                type: "update",
                title: "Profile Views Increased",
                description: "Your startup profile has been viewed 25 times this week",
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                isRead: true,
                priority: "medium",
              },
              {
                id: "5",
                type: "system",
                title: "Fundraising Tips",
                description: 'New article: "How to prepare for Series A due diligence"',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                isRead: true,
                priority: "low",
              },
            ]

      setNotifications(mockNotifications)
      setLoading(false)
    }, 800)
  }, [userType])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "match":
        return <Users className="h-4 w-4" />
      case "update":
        return <TrendingUp className="h-4 w-4" />
      case "system":
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50"
      case "medium":
        return "text-yellow-600 bg-yellow-50"
      case "low":
        return "text-gray-600 bg-gray-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = diff / (1000 * 60)
    const hours = diff / (1000 * 60 * 60)
    const days = diff / (1000 * 60 * 60 * 24)

    if (minutes < 60) return `${Math.floor(minutes)}m ago`
    if (hours < 24) return `${Math.floor(hours)}h ago`
    return `${Math.floor(days)}d ago`
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const filteredNotifications = notifications.filter((notif) => {
    switch (filter) {
      case "unread":
        return !notif.isRead
      case "important":
        return notif.priority === "high"
      default:
        return true
    }
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-600" />
            Notifications
            {unreadCount > 0 && <Badge className="bg-emerald-600 text-white">{unreadCount}</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark All Read
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="important">Important</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No notifications to show</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                        !notification.isRead ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {notification.avatar ? (
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={notification.avatar || "/placeholder.svg"} alt="Avatar" />
                              <AvatarFallback>{getNotificationIcon(notification.type)}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm">{notification.title}</h3>
                              {!notification.isRead && <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>}
                              <Badge variant="outline" className="text-xs">
                                {notification.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                            <p className="text-xs text-gray-400">{formatTime(notification.timestamp)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 ml-2">
                          {!notification.isRead && (
                            <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

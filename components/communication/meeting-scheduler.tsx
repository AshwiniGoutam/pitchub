"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CalendarIcon, Clock, Video, MapPin, Users, Plus, Check } from "lucide-react"

interface Meeting {
  id: string
  title: string
  participantName: string
  participantAvatar: string
  participantRole: string
  date: Date
  duration: number
  type: "video" | "phone" | "in-person"
  location?: string
  status: "scheduled" | "confirmed" | "completed" | "cancelled"
  agenda?: string
}

interface MeetingSchedulerProps {
  userType: "investor" | "startup"
}

export function MeetingScheduler({ userType }: MeetingSchedulerProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: "1",
      title: "Series A Discussion",
      participantName: userType === "investor" ? "TechFlow AI" : "Sarah Chen",
      participantAvatar: "/participant.png",
      participantRole: userType === "investor" ? "CEO & Founder" : "Partner at Sequoia",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      duration: 60,
      type: "video",
      status: "scheduled",
      agenda: "Discuss funding requirements, traction metrics, and next steps",
    },
    {
      id: "2",
      title: "Follow-up Call",
      participantName: userType === "investor" ? "GreenEnergy Solutions" : "Michael Rodriguez",
      participantAvatar: "/participant2.jpg",
      participantRole: userType === "investor" ? "CTO" : "Principal at a16z",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      duration: 30,
      type: "phone",
      status: "confirmed",
      agenda: "Technical deep dive and product roadmap discussion",
    },
  ])

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isScheduling, setIsScheduling] = useState(false)
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    participantName: "",
    duration: 30,
    type: "video" as const,
    agenda: "",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "phone":
        return <Clock className="h-4 w-4" />
      case "in-person":
        return <MapPin className="h-4 w-4" />
      default:
        return <Video className="h-4 w-4" />
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleScheduleMeeting = () => {
    if (!selectedDate || !newMeeting.title || !newMeeting.participantName) return

    const meeting: Meeting = {
      id: Date.now().toString(),
      title: newMeeting.title,
      participantName: newMeeting.participantName,
      participantAvatar: "/new-participant.png",
      participantRole: userType === "investor" ? "Founder" : "Investor",
      date: selectedDate,
      duration: newMeeting.duration,
      type: newMeeting.type,
      status: "scheduled",
      agenda: newMeeting.agenda,
    }

    setMeetings((prev) => [...prev, meeting])
    setIsScheduling(false)
    setNewMeeting({
      title: "",
      participantName: "",
      duration: 30,
      type: "video",
      agenda: "",
    })
  }

  const upcomingMeetings = meetings
    .filter((m) => m.date > new Date() && m.status !== "cancelled")
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const todaysMeetings = meetings.filter((m) => {
    const today = new Date()
    return m.date.toDateString() === today.toDateString() && m.status !== "cancelled"
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-emerald-600" />
              Meeting Scheduler
            </CardTitle>
            <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Schedule New Meeting</DialogTitle>
                  <DialogDescription>
                    Set up a meeting with an {userType === "investor" ? "entrepreneur" : "investor"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Meeting Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Series A Discussion"
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="participant">Participant Name</Label>
                    <Input
                      id="participant"
                      placeholder={userType === "investor" ? "Startup name" : "Investor name"}
                      value={newMeeting.participantName}
                      onChange={(e) => setNewMeeting((prev) => ({ ...prev, participantName: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select
                        value={newMeeting.duration.toString()}
                        onValueChange={(value) =>
                          setNewMeeting((prev) => ({ ...prev, duration: Number.parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="type">Meeting Type</Label>
                      <Select
                        value={newMeeting.type}
                        onValueChange={(value) => setNewMeeting((prev) => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video Call</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="in-person">In Person</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="agenda">Agenda (Optional)</Label>
                    <Textarea
                      id="agenda"
                      placeholder="Meeting agenda and topics to discuss..."
                      value={newMeeting.agenda}
                      onChange={(e) => setNewMeeting((prev) => ({ ...prev, agenda: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Select Date & Time</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      disabled={(date) => date < new Date()}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsScheduling(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleScheduleMeeting}>Schedule Meeting</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {todaysMeetings.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                Today's Meetings
              </h3>
              <div className="space-y-3">
                {todaysMeetings.map((meeting) => (
                  <Card key={meeting.id} className="border-l-4 border-l-emerald-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={meeting.participantAvatar || "/placeholder.svg"}
                              alt={meeting.participantName}
                            />
                            <AvatarFallback>{meeting.participantName.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{meeting.title}</h4>
                            <p className="text-sm text-gray-600">{meeting.participantName}</p>
                            <p className="text-xs text-gray-500">{meeting.participantRole}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            {getMeetingIcon(meeting.type)}
                            <span className="text-sm font-medium">{meeting.duration}m</span>
                          </div>
                          <Badge className={getStatusColor(meeting.status)}>{meeting.status}</Badge>
                        </div>
                      </div>
                      {meeting.agenda && <p className="text-sm text-gray-600 mt-3 pl-13">{meeting.agenda}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              Upcoming Meetings
            </h3>
            <div className="space-y-3">
              {upcomingMeetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming meetings scheduled</p>
                  <Button variant="outline" className="mt-2 bg-transparent" onClick={() => setIsScheduling(true)}>
                    Schedule Your First Meeting
                  </Button>
                </div>
              ) : (
                upcomingMeetings.map((meeting) => (
                  <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={meeting.participantAvatar || "/placeholder.svg"}
                              alt={meeting.participantName}
                            />
                            <AvatarFallback>{meeting.participantName.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{meeting.title}</h4>
                            <p className="text-sm text-gray-600">{meeting.participantName}</p>
                            <p className="text-xs text-gray-500">{meeting.participantRole}</p>
                            <p className="text-sm font-medium text-emerald-600 mt-1">{formatDate(meeting.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            {getMeetingIcon(meeting.type)}
                            <span className="text-sm font-medium">{meeting.duration}m</span>
                          </div>
                          <Badge className={getStatusColor(meeting.status)}>{meeting.status}</Badge>
                          <div className="flex gap-1 mt-2">
                            <Button variant="outline" size="sm">
                              Reschedule
                            </Button>
                            <Button size="sm">
                              <Check className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                          </div>
                        </div>
                      </div>
                      {meeting.agenda && <p className="text-sm text-gray-600 mt-3 pl-13">{meeting.agenda}</p>}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Send, Paperclip, Calendar, Phone, Video, MoreVertical, Star, Archive } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  timestamp: Date
  type: "text" | "file" | "meeting"
  isRead: boolean
}

interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantAvatar: string
  participantRole: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isStarred: boolean
  matchScore?: number
}

interface ChatInterfaceProps {
  userType: "investor" | "startup"
}

export function ChatInterface({ userType }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      const mockConversations: Conversation[] =
        userType === "investor"
          ? [
              {
                id: "1",
                participantId: "startup1",
                participantName: "TechFlow AI",
                participantAvatar: "/tech-startup-office.png",
                participantRole: "CEO & Founder",
                lastMessage: "Thanks for your interest! I'd love to discuss our Series A round.",
                lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
                unreadCount: 2,
                isStarred: true,
                matchScore: 94,
              },
              {
                id: "2",
                participantId: "startup2",
                participantName: "GreenEnergy Solutions",
                participantAvatar: "/green-energy-landscape.png",
                participantRole: "CTO",
                lastMessage: "Our latest prototype results are very promising.",
                lastMessageTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                unreadCount: 0,
                isStarred: false,
                matchScore: 87,
              },
            ]
          : [
              {
                id: "1",
                participantId: "investor1",
                participantName: "Sarah Chen",
                participantAvatar: "/investor-woman.jpg",
                participantRole: "Partner at Sequoia Capital",
                lastMessage: "I'd like to schedule a follow-up call to discuss your traction metrics.",
                lastMessageTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
                unreadCount: 1,
                isStarred: true,
                matchScore: 96,
              },
              {
                id: "2",
                participantId: "investor2",
                participantName: "Michael Rodriguez",
                participantAvatar: "/investor-man.jpg",
                participantRole: "Principal at a16z",
                lastMessage: "Your pitch deck looks interesting. Can we set up a meeting?",
                lastMessageTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
                unreadCount: 0,
                isStarred: false,
                matchScore: 91,
              },
            ]

      setConversations(mockConversations)
      setSelectedConversation(mockConversations[0])
      setLoading(false)
    }, 1000)
  }, [userType])

  useEffect(() => {
    if (selectedConversation) {
      // Mock messages for selected conversation
      const mockMessages: Message[] = [
        {
          id: "1",
          senderId: selectedConversation.participantId,
          senderName: selectedConversation.participantName,
          senderAvatar: selectedConversation.participantAvatar,
          content:
            userType === "investor"
              ? "Hi! I saw your investment in similar companies and think we'd be a great fit."
              : "Thank you for your interest in our startup. I'd love to share more details.",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          type: "text",
          isRead: true,
        },
        {
          id: "2",
          senderId: "current-user",
          senderName: "You",
          senderAvatar: "/diverse-user-avatars.png",
          content:
            userType === "investor"
              ? "Thanks for reaching out! I'd like to learn more about your traction and business model."
              : "I'm excited about the possibility of working together. What would you like to know first?",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
          type: "text",
          isRead: true,
        },
        {
          id: "3",
          senderId: selectedConversation.participantId,
          senderName: selectedConversation.participantName,
          senderAvatar: selectedConversation.participantAvatar,
          content: selectedConversation.lastMessage,
          timestamp: selectedConversation.lastMessageTime,
          type: "text",
          isRead: false,
        },
      ]
      setMessages(mockMessages)
    }
  }, [selectedConversation, userType])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: "current-user",
      senderName: "You",
      senderAvatar: "/diverse-user-avatars.png",
      content: newMessage,
      timestamp: new Date(),
      type: "text",
      isRead: true,
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Update conversation last message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id ? { ...conv, lastMessage: newMessage, lastMessageTime: new Date() } : conv,
      ),
    )
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = diff / (1000 * 60 * 60)

    if (hours < 1) return "Just now"
    if (hours < 24) return `${Math.floor(hours)}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                  selectedConversation?.id === conversation.id ? "bg-emerald-50 border-l-4 border-l-emerald-600" : ""
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={conversation.participantAvatar || "/placeholder.svg"}
                        alt={conversation.participantName}
                      />
                      <AvatarFallback>{conversation.participantName.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm truncate">{conversation.participantName}</h3>
                      <div className="flex items-center gap-1">
                        {conversation.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                        {conversation.matchScore && (
                          <Badge variant="outline" className="text-xs">
                            {conversation.matchScore}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{conversation.participantRole}</p>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(conversation.lastMessageTime)}</p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="lg:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedConversation.participantAvatar || "/placeholder.svg"}
                      alt={selectedConversation.participantName}
                    />
                    <AvatarFallback>{selectedConversation.participantName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.participantName}</h3>
                    <p className="text-sm text-gray-500">{selectedConversation.participantRole}</p>
                  </div>
                  {selectedConversation.matchScore && (
                    <Badge className="bg-emerald-100 text-emerald-800">{selectedConversation.matchScore}% match</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Star Conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === "current-user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-start space-x-2 max-w-[70%] ${
                          message.senderId === "current-user" ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
                          <AvatarFallback>{message.senderName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-lg p-3 ${
                            message.senderId === "current-user"
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === "current-user" ? "text-emerald-100" : "text-gray-500"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              <Separator />

              <div className="p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Filter, Star, Archive, Trash2, MoreHorizontal } from "lucide-react"
import { InvestorSidebar } from "@/components/investor-sidebar"

interface Email {
  id: string
  subject: string
  from: string
  date: string
  body: string
  attachments: Array<{
    filename: string
    mimeType: string
    data: string
  }>
}

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEmails() {
      try {
        const res = await fetch("/api/gmail")
        if (!res.ok) throw new Error("Failed to fetch emails")
        const data = await res.json()
        setEmails(data)
        setSelectedEmail(data[0] || null)
      } catch (err) {
        console.error("Error fetching emails:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchEmails()
  }, [])

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase())

    return activeFilter === "all" ? matchesSearch : matchesSearch
  })

  return (
    <div className="h-screen flex">
      <InvestorSidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-white p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Inbox</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-72"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Email List */}
          <div className="w-1/3 border-r bg-white p-4 w-[20%]">
            {loading ? (
              <p className="text-gray-500">Loading emails...</p>
            ) : (
              <ScrollArea className="h-full w-full">
                {filteredEmails.map((email) => (
                  <Card
                    key={email.id}
                    className={`w-[100%] p-4 mb-4 mx-1 mt-2 border-b cursor-pointer ${
                      selectedEmail?.id === email.id
                        ? "bg-blue-50 ring-1 ring-blue-300"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="w-[100%] flex gap-2 justify-between items-start">
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${email.from}`}
                          />
                          <AvatarFallback>{email.from[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{email.from}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(email.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Star className="w-4 h-4 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-medium truncate mt-1">
                      {email.subject}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2">{email.body}</p>
                  </Card>
                ))}
              </ScrollArea>
            )}
          </div>

          {/* Email Details */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedEmail ? (
              <>
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">{selectedEmail.subject}</h2>
                    <p className="text-sm text-gray-500">From: {selectedEmail.from}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(selectedEmail.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div
                  className="prose whitespace-pre-wrap text-gray-700"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                />

                {/* Attachments */}
                {selectedEmail.attachments.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Attachments</h3>
                    <ul className="space-y-2">
                      {selectedEmail.attachments.map((att, idx) => (
                        <li key={idx} className="text-sm text-blue-600 underline">
                          <a
                            href={`data:${att.mimeType};base64,${att.data}`}
                            download={att.filename}
                          >
                            {att.filename}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select an email to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

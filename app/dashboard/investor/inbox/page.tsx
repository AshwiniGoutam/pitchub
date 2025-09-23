"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Filter,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  MoreHorizontal,
  Paperclip,
  Calendar,
  Building,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { InvestorSidebar } from "@/components/investor-sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DOMPurify from "dompurify";

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  status: "new" | "reviewed" | "interested" | "rejected" | "draft";
  attachments: Array<{
    filename: unknown;
    data: any;
    mimeType: any;
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
  startup?: {
    name: string;
    sector: string;
    stage: string;
    location: string;
    funding: string;
    relevanceScore: number;
  };
}

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmails() {
      try {
        const res = await fetch("/api/gmail");
        if (!res.ok) throw new Error("Failed to fetch emails");
        const data = await res.json();
        setEmails(data);
        setSelectedEmail(data[0] || null);
      } catch (err) {
        console.error("Error fetching emails:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEmails();
  }, []);

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "unread" && !email.isRead) ||
      (activeFilter === "starred" && email.isStarred) ||
      email.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  function cleanEmailBody(body: string) {
    const noStyle = body.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ""); // remove <style> blocks
    const noClasses = noStyle.replace(/\sclass="[^"]*"/gi, ""); // strip classes
    return DOMPurify.sanitize(noClasses, { USE_PROFILES: { html: true } });
  }

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

        {/* Tabs */}
        <div className="border-b bg-gray-50 px-4 py-2">
          <Tabs value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList className="grid grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="starred">Starred</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="interested">Interested</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Email List */}
          <div className="w-1/3 border-r bg-white p-4 w-[400px]">
            {loading ? (
              <p className="text-gray-500">Loading emails...</p>
            ) : (
              <div className="h-full overflow-y-scroll">
                {filteredEmails.map((email) => (
                  <Card
                    key={email.id}
                    className={`p-4 mb-4 mx-1 mt-2 border-b cursor-pointer ${
                      selectedEmail?.id === email.id
                        ? "bg-blue-50 ring-1 ring-blue-300"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="flex gap-2 justify-between items-start">
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${email.from}`}
                          />
                          <AvatarFallback>{email.from[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p
                            className={`text-sm ${
                              !email.isRead ? "font-bold" : "font-medium"
                            }`}
                          >
                            {email.from}
                          </p>
                          <p className="text-xs text-gray-500">
                            {email.fromEmail}
                          </p>
                        </div>
                      </div>
                      <Star
                        className={`w-4 h-4 cursor-pointer ${
                          email.isStarred
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </div>
                    <h3 className="truncate mt-1">{email.subject}</h3>

                    {/* <p className="text-xs text-gray-600 line-clamp-1">
                      {email.body}
                    </p> */}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Email Details */}
          <div className="flex-1 p-6 overflow-y-auto w-[600px]">
            {selectedEmail ? (
              <>
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedEmail.subject}
                    </h2>
                    <p className="text-sm text-gray-500">
                      From: {selectedEmail.from}
                    </p>
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

                {/* <div
                  className="prose whitespace-pre-wrap text-gray-700"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                /> */}
                <div
                  className="prose whitespace-pre-wrap text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: cleanEmailBody(selectedEmail.body),
                  }}
                />

                {/* Attachments */}
                {selectedEmail.attachments.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Attachments</h3>
                    <ul className="space-y-2">
                      {selectedEmail.attachments.map((att, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-blue-600 underline"
                        >
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

         {selectedEmail && <div className="pitch-details-btns">
              <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                  View Pitch Deck Summary
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <Card className="mt-4 p-4 border-blue-200 bg-blue-50">
                  <h3 className="text-sm font-semibold mb-2">
                    Pitch Deck Summary
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    <li>300% revenue growth in last 12 months</li>
                    <li>15+ partnerships with major hospitals</li>
                    <li>FDA approval for diagnostic algorithm</li>
                    <li>Strong customer retention & product-market fit</li>
                  </ul>
                </Card>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="mt-2 ml-4 border-green-600 text-green-600 hover:bg-green-50"
                >
                  View Competitive Analysis
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <Card className="mt-4 p-4 border-green-200 bg-green-50">
                  <h3 className="text-sm font-semibold mb-3">
                    Competitive Analysis
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">MedAI Solutions</span>
                      <span className="text-green-600">Series A • $5M</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Competitor: HealthIQ</span>
                      <span>Series B • $25M</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Competitor: AI Diagnostics</span>
                      <span>Seed • $2M</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Competitor: MediTech</span>
                      <span>Series A • $8M</span>
                    </div>
                  </div>
                </Card>
              </DialogContent>
            </Dialog>
          </div>}
          </div>
        </div>
      </div>
    </div>
  );
}

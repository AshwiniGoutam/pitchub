"use client";

import { useState } from "react";
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

// --- MOCK EMAILS ---
const mockEmails: Email[] = [
  {
    id: "1",
    from: "Sarah Chen",
    fromEmail: "sarah@medaihealth.com",
    subject: "Series A Funding - AI-Powered Healthcare Platform",
    preview:
      "We are seeking $5M Series A funding for our AI healthcare platform that reduces diagnostic errors by 40%...",
    content: `Dear Investor,

I hope this email finds you well. I'm Sarah Chen, CEO and co-founder of MedAI Solutions, an AI-powered healthcare platform that's revolutionizing patient diagnosis and treatment recommendations.

We're currently raising our Series A round of $5M to accelerate our growth and expand our market presence. Here are some key highlights:

• 300% revenue growth over the past 12 months  
• Partnership with 15+ major hospitals  
• FDA approval for our core diagnostic algorithm  
• Team of 25+ engineers and medical professionals  
• Proven product-market fit with strong customer retention  

Our platform uses advanced machine learning to analyze medical data and provide accurate diagnosis recommendations, reducing diagnostic errors by 40% and improving patient outcomes significantly.

We’d love to schedule a call to discuss this opportunity further and share our detailed pitch deck with you.

Best regards,  
Sarah Chen  
CEO, MedAI Solutions`,
    timestamp: "2024-01-15T10:30:00Z",
    isRead: false,
    isStarred: true,
    status: "new",
    attachments: [
      { name: "MedAI_Pitch_Deck.pdf", type: "pdf", size: "2.4 MB", url: "#" },
      {
        name: "Financial_Projections.xlsx",
        type: "excel",
        size: "1.1 MB",
        url: "#",
      },
    ],
    startup: {
      name: "MedAI Solutions",
      sector: "HealthTech",
      stage: "Series A",
      location: "San Francisco, CA",
      funding: "$5M",
      relevanceScore: 92,
    },
  },
  {
    id: "2",
    from: "Michael Rodriguez",
    fromEmail: "mike@paychain.io",
    subject: "Seed Round - Blockchain Payment Solution",
    preview:
      "Revolutionary blockchain payment platform seeking $2M seed funding. 50K+ active users and growing...",
    content: `Hi there,

I'm Michael Rodriguez, founder of PayChain, a blockchain-based payment solution that's gaining significant traction in the fintech space.

We're raising a $2M seed round and would love to have you as an investor. Key metrics:

• 50,000+ active users  
• $10M+ in transaction volume  
• 25% month-over-month growth  
• Strategic partnerships with 3 major banks  

Our solution addresses the high fees and slow settlement times in traditional payment systems. We believe this is the future of payments.

Would you be interested in learning more? Happy to share our deck and financial model.

Best,  
Michael Rodriguez  
Founder, PayChain`,
    timestamp: "2024-01-14T14:20:00Z",
    isRead: true,
    isStarred: false,
    status: "reviewed",
    attachments: [
      { name: "PayChain_Overview.pdf", type: "pdf", size: "1.8 MB", url: "#" },
      {
        name: "User_Growth_Chart.png",
        type: "image",
        size: "450 KB",
        url: "#",
      },
    ],
    startup: {
      name: "PayChain",
      sector: "FinTech",
      stage: "Seed",
      location: "New York, NY",
      funding: "$2M",
      relevanceScore: 78,
    },
  },
  {
    id: "3",
    from: "Emily Watson",
    fromEmail: "emily@agrismart.co",
    subject: "Pre-Series A - Smart Agriculture IoT Platform",
    preview:
      "IoT-powered agriculture platform helping farmers increase yield by 35%. Seeking $3M Pre-Series A...",
    content: `Dear Investment Team,

I'm Emily Watson, CEO of AgriSmart, an IoT platform that's transforming modern agriculture through smart sensors and AI analytics.

We're seeking $3M in Pre-Series A funding to scale our operations. Our impact so far:

• 35% average yield increase for farmers  
• 500+ farms using our platform  
• $2M ARR with 95% customer retention  
• Partnerships with John Deere and other major equipment manufacturers  

Our platform provides real-time soil monitoring, weather predictions, and automated irrigation recommendations.

We’d love to present our vision and roadmap.

Warm regards,  
Emily Watson  
CEO, AgriSmart`,
    timestamp: "2024-01-13T09:15:00Z",
    isRead: true,
    isStarred: false,
    status: "interested",
    attachments: [
      { name: "AgriSmart_Deck.pdf", type: "pdf", size: "3.1 MB", url: "#" },
    ],
    startup: {
      name: "AgriSmart",
      sector: "AgriTech",
      stage: "Pre-Series A",
      location: "Austin, TX",
      funding: "$3M",
      relevanceScore: 65,
    },
  },
  {
    id: "4",
    from: "Ravi Mehta",
    fromEmail: "ravi@edulink.io",
    subject: "Series B - AI-driven EdTech Platform for Universities",
    preview:
      "Edulink is an AI-powered platform used by 120 universities worldwide. Seeking $12M Series B...",
    content: `Hello Investor,

My name is Ravi Mehta, founder of Edulink, an AI-driven EdTech platform providing personalized learning and analytics to universities.

Highlights:
• 120 universities using Edulink across 8 countries  
• 1.5M active students on platform  
• 70% student engagement improvement compared to traditional LMS  
• $8M ARR with 150% YoY growth  

We are raising $12M Series B to expand globally and enhance our AI capabilities.

Looking forward to sharing our full pitch.

Thanks,  
Ravi Mehta  
Founder & CEO, Edulink`,
    timestamp: "2024-01-12T16:45:00Z",
    isRead: false,
    isStarred: false,
    status: "draft",
    attachments: [
      {
        name: "Edulink_SeriesB_Pitch.pdf",
        type: "pdf",
        size: "5.2 MB",
        url: "#",
      },
      {
        name: "Student_Engagement_Data.xlsx",
        type: "excel",
        size: "2.2 MB",
        url: "#",
      },
    ],
    startup: {
      name: "Edulink",
      sector: "EdTech",
      stage: "Series B",
      location: "Bangalore, India",
      funding: "$12M",
      relevanceScore: 88,
    },
  },
];

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(emails[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

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
          <div className="w-1/3 border-r bg-white p-4">
            <ScrollArea className="h-full">
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
                  <h3 className="text-sm font-medium truncate mt-1">
                    {email.subject}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {email.preview}
                  </p>
                </Card>
              ))}
            </ScrollArea>
          </div>

          {/* Email Details */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedEmail ? (
              <>
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedEmail.subject}
                    </h2>
                    <p className="text-sm text-gray-500">
                      From: {selectedEmail.from} &lt;{selectedEmail.fromEmail}
                      &gt;
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(selectedEmail.timestamp).toLocaleString()}
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

                <div className="prose whitespace-pre-wrap text-gray-700">
                  {selectedEmail.content}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select an email to view details
              </div>
            )}

            {/* <Card className="mt-4 p-4 border-blue-200 bg-blue-50">
              <h3 className="text-sm font-semibold mb-2">Pitch Deck Summary</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>300% revenue growth in last 12 months</li>
                <li>15+ partnerships with major hospitals</li>
                <li>FDA approval for diagnostic algorithm</li>
                <li>Strong customer retention & product-market fit</li>
              </ul>
            </Card>

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
            </Card> */}

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
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { Bell, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { InvestorSidebar } from "@/components/investor-sidebar";
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
  const router = useRouter();

  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [emailSummaries, setEmailSummaries] = useState<Record<string, string>>(
    {}
  );
  const [summaryLoading, setSummaryLoading] = useState<string | null>(null);

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

  const fetchEmailSummary = async (email: Email) => {
    if (emailSummaries[email.id]) return; // Already fetched

    setSummaryLoading(email.id);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: email.content, title: email.subject }),
      });

      if (!res.ok) throw new Error("Failed to get summary");

      const data = await res.json();
      setEmailSummaries((prev) => ({ ...prev, [email.id]: data.summary }));
    } catch (err) {
      console.error(err);
      setEmailSummaries((prev) => ({
        ...prev,
        [email.id]: "Failed to generate summary.",
      }));
    } finally {
      setSummaryLoading(null);
    }
  };

  useEffect(() => {
    if (selectedEmail) {
      fetchEmailSummary(selectedEmail);
    }
  }, [selectedEmail]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <InvestorSidebar />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
            <p className="text-muted-foreground text-lg">
              Loading Inbox...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <InvestorSidebar />

      <div className="flex flex-1 overflow-hidden">
        {/* Inbox List */}
        <div
          className={`${
            selectedEmail ? "w-2/3" : "w-full"
          } overflow-auto border-r bg-white transition-all`}
        >
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-white">
            <div className="flex h-16 items-center justify-between px-8">
              <div>
                <h1 className="text-2xl font-bold">Inbox</h1>
                <p className="text-sm text-gray-600">
                  An overview of your deal flow activity.
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Table */}
          {/* Inbox Table (Emails) */}
          <div className="p-8">
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Sector
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Relevance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredEmails.map((email) => (
                    <tr
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedEmail?.id === email.id ? "bg-emerald-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {email.from}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {email.sector}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Progress
                            value={email.relevanceScore}
                            className="h-2 w-24"
                          />
                          <span className="text-sm font-medium">
                            {email.relevanceScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={`${
                            email?.status == "Contacted"
                              ? "bg-blue-100 text-blue-700"
                              : email?.status == "Under Evaluation"
                              ? "bg-yellow-100 text-yellow-700"
                              : email?.status == "Pending"
                              ? "bg-red-100 text-red-700"
                              : email?.status == "New"
                              ? "bg-emerald-100 text-emerald-700"
                              : ""
                          }`}
                        >
                          {email.status}
                        </Badge>
                      </td>
                      {/* <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(email.timestamp).toLocaleString()}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pitch Detail Panel */}
        {selectedEmail && (
          <div className="w-1/3 overflow-auto bg-white p-6">
            <div className="mb-6 flex items-start justify-between">
              <h2 className="text-2xl font-bold">{selectedEmail.subject}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedEmail(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <Tabs defaultValue="pitch-deck" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pitch-deck">Pitch Deck</TabsTrigger>
                <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              </TabsList>
              <TabsContent value="pitch-deck" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-48 items-center justify-center rounded-lg bg-gray-100">
                      <p className="text-gray-400">Pitch Deck Preview</p>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="mb-3 font-semibold">AI-Generated Summary</h3>
                  {summaryLoading === selectedEmail?.id ? (
                    <p className="text-sm text-gray-600">
                      Generating summary...
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {selectedEmail
                        ? emailSummaries[selectedEmail.id] ||
                          "No summary available."
                        : ""}
                    </p>
                  )}
                </div>

                <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Download className="h-4 w-4" />
                  Download Pitch Deck
                </Button>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    Accept
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Reject
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="ai-insights" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-3 font-semibold">Competitive Analysis</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                        <p className="text-sm text-gray-600">
                          Higher efficiency than current market leaders.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                        <p className="text-sm text-gray-600">
                          Manufacturing costs are currently higher.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-3 font-semibold">Market Research</h3>
                    <p className="text-sm text-gray-600">
                      The renewable energy market is projected to grow by 15%
                      annually. Government incentives for green technology
                      provide a favorable environment for market entry.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

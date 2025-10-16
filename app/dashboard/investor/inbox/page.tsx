"use client";
import { useEffect, useState } from "react";
import { Bell, X, Download, TrendingUp, AlertTriangle, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { InvestorSidebar } from "@/components/investor-sidebar";

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

interface EmailAnalysis {
  summary: string;
  sector: string;
  keyPoints: string[];
  urgency: "High" | "Medium" | "Low";
  actionItems: string[];
  sentiment: "Positive" | "Neutral" | "Negative";
  fundingMentioned: boolean;
  metricsMentioned: boolean;
  growthStage: "Early" | "Expansion" | "Mature";
  riskLevel: "High" | "Medium" | "Low";
  competitivePosition: "Leading" | "Emerging" | "Challenger";
}

export default function InboxPage() {
  const router = useRouter();

  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [emailAnalyses, setEmailAnalyses] = useState<Record<string, EmailAnalysis>>({});
  const [analysisLoading, setAnalysisLoading] = useState<string | null>(null);

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

  const fetchEmailAnalysis = async (email: Email) => {
    if (emailAnalyses[email.id]) return; // Already fetched

    setAnalysisLoading(email.id);
    try {
      const res = await fetch("/api/summarize-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailContent: email.content }),
      });

      if (!res.ok) throw new Error("Failed to get analysis");

      const data = await res.json();
      setEmailAnalyses((prev) => ({ ...prev, [email.id]: data }));
    } catch (err) {
      console.error(err);
      // Set fallback analysis
      setEmailAnalyses((prev) => ({
        ...prev,
        [email.id]: {
          summary: "Failed to generate analysis. Please try again.",
          sector: "Unknown",
          keyPoints: ["Analysis unavailable"],
          urgency: "Medium",
          actionItems: ["Review manually"],
          sentiment: "Neutral",
          fundingMentioned: false,
          metricsMentioned: false,
          growthStage: "Early",
          riskLevel: "Medium",
          competitivePosition: "Emerging"
        }
      }));
    } finally {
      setAnalysisLoading(null);
    }
  };

  useEffect(() => {
    if (selectedEmail) {
      fetchEmailAnalysis(selectedEmail);
    }
  }, [selectedEmail]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High": return "text-red-600 bg-red-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      case "Low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive": return "text-green-600 bg-green-100";
      case "Negative": return "text-red-600 bg-red-100";
      case "Neutral": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High": return "text-red-600";
      case "Medium": return "text-yellow-600";
      case "Low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getGrowthStageColor = (stage: string) => {
    switch (stage) {
      case "Early": return "text-blue-600 bg-blue-100";
      case "Expansion": return "text-purple-600 bg-purple-100";
      case "Mature": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

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
          <div className="p-8">
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Sector
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredEmails.map((email) => {
                    const analysis = emailAnalyses[email.id];
                    return (
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
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {email.subject}
                        </td>
                        <td className="px-6 py-4">
                          {analysis ? (
                            <Badge variant="outline" className="border-blue-200 text-blue-700">
                              {analysis.sector}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">Analyzing...</span>
                          )}
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Email Detail Panel */}
        {selectedEmail && (
          <div className="w-1/3 overflow-auto bg-white p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedEmail.subject}</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedEmail.from}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedEmail(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <Tabs defaultValue="ai-summary" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ai-summary">AI Summary</TabsTrigger>
                <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ai-summary" className="space-y-6">
                {analysisLoading === selectedEmail.id ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-3"></div>
                          <p className="text-sm text-gray-600">Analyzing email content...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : emailAnalyses[selectedEmail.id] ? (
                  <>
                    {/* Executive Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Target className="h-5 w-5 text-blue-600" />
                          Executive Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {emailAnalyses[selectedEmail.id].summary}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Key Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Key Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm text-blue-600 font-medium">Sector</div>
                            <div className="text-lg font-bold text-blue-800">
                              {emailAnalyses[selectedEmail.id].sector}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-sm text-green-600 font-medium">Growth Stage</div>
                            <div className="text-lg font-bold text-green-800">
                              {emailAnalyses[selectedEmail.id].growthStage}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-sm text-orange-600 font-medium">Competitive Position</div>
                            <div className="text-lg font-bold text-orange-800">
                              {emailAnalyses[selectedEmail.id].competitivePosition}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-sm text-purple-600 font-medium">Funding Mentioned</div>
                            <div className="text-lg font-bold text-purple-800">
                              {emailAnalyses[selectedEmail.id].fundingMentioned ? "Yes" : "No"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Key Points */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Key Points</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {emailAnalyses[selectedEmail.id].keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Action Items */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Action Items</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {emailAnalyses[selectedEmail.id].actionItems.map((action, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-600 text-center py-4">
                        No analysis available. Click to analyze this email.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="ai-insights" className="space-y-6">
                {emailAnalyses[selectedEmail.id] ? (
                  <>
                    {/* Risk & Sentiment Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          Risk & Sentiment Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-sm text-red-600 font-medium">Risk Level</div>
                            <div className={`text-lg font-bold ${getRiskColor(emailAnalyses[selectedEmail.id].riskLevel)}`}>
                              {emailAnalyses[selectedEmail.id].riskLevel}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm text-blue-600 font-medium">Sentiment</div>
                            <Badge className={getSentimentColor(emailAnalyses[selectedEmail.id].sentiment)}>
                              {emailAnalyses[selectedEmail.id].sentiment}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <div className="text-sm text-yellow-600 font-medium">Urgency</div>
                          <Badge className={getUrgencyColor(emailAnalyses[selectedEmail.id].urgency)}>
                            {emailAnalyses[selectedEmail.id].urgency} Priority
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Investment Readiness */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          Investment Readiness
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Growth Stage</span>
                            <Badge className={getGrowthStageColor(emailAnalyses[selectedEmail.id].growthStage)}>
                              {emailAnalyses[selectedEmail.id].growthStage}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Metrics Provided</span>
                            <Badge className={emailAnalyses[selectedEmail.id].metricsMentioned ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {emailAnalyses[selectedEmail.id].metricsMentioned ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Funding Discussion</span>
                            <Badge className={emailAnalyses[selectedEmail.id].fundingMentioned ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                              {emailAnalyses[selectedEmail.id].fundingMentioned ? "Present" : "Not Mentioned"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sector Insights */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Sector Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">{emailAnalyses[selectedEmail.id].sector} Sector</h4>
                          <p className="text-sm text-blue-700">
                            {emailAnalyses[selectedEmail.id].sector === "SaaS" && "High-margin business model with recurring revenue. Focus on MRR growth, customer acquisition costs, and churn rates."}
                            {emailAnalyses[selectedEmail.id].sector === "FinTech" && "Regulatory compliance is key. Evaluate partnerships with financial institutions and user adoption metrics."}
                            {emailAnalyses[selectedEmail.id].sector === "HealthTech" && "Long sales cycles but high barriers to entry. Check for FDA approvals and clinical validation."}
                            {emailAnalyses[selectedEmail.id].sector === "AI/ML" && "Evaluate technical differentiation and IP protection. Talent acquisition and computational costs are critical."}
                            {emailAnalyses[selectedEmail.id].sector === "E-commerce" && "Focus on unit economics, customer LTV, and scalability of customer acquisition strategies."}
                            {!["SaaS", "FinTech", "HealthTech", "AI/ML", "E-commerce"].includes(emailAnalyses[selectedEmail.id].sector) && 
                              "Evaluate market size, competitive landscape, and unique value proposition. Consider scalability and defensibility."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Next Steps */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Clock className="h-5 w-5 text-purple-600" />
                          Recommended Next Steps
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {emailAnalyses[selectedEmail.id].urgency === "High" && (
                            <p className="text-sm text-red-600 font-medium">🚨 Immediate attention required</p>
                          )}
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                Schedule call within {emailAnalyses[selectedEmail.id].urgency === "High" ? "24 hours" : "this week"}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                Request {!emailAnalyses[selectedEmail.id].metricsMentioned ? "detailed metrics and " : ""}financial projections
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                Conduct due diligence on {emailAnalyses[selectedEmail.id].sector} market dynamics
                              </span>
                            </li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-600 mb-4">
                          No AI insights available yet.
                        </p>
                        <Button 
                          onClick={() => fetchEmailAnalysis(selectedEmail)}
                          disabled={analysisLoading === selectedEmail.id}
                        >
                          {analysisLoading === selectedEmail.id ? "Analyzing..." : "Generate AI Insights"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                Accept & Schedule Call
              </Button>
              <Button variant="outline" className="flex-1">
                Request More Info
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { Bell, X, Download, TrendingUp, BarChart3, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { InvestorSidebar } from "@/components/investor-sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  status: "new" | "reviewed" | "interested" | "rejected" | "draft";
  attachments: Array<{
    id: string;
    filename: string;
    mimeType: string;
    size: string;
    url: string;
    data?: any;
    name?: string;
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
  competitiveAnalysis: string[];
  marketResearch: string;
  fundingMentioned: boolean;
  growthStage: "Early" | "Expansion" | "Mature";
}

interface SectorResult {
  emailId: string;
  sector: string;
  method: 'keywords' | 'gemini' | 'error';
}

export default function InboxPage() {
  const router = useRouter();

  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [processingEmails, setProcessingEmails] = useState(true);
  const [progress, setProgress] = useState(0);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [predictionStats, setPredictionStats] = useState({ total: 0, gemini: 0, keywords: 0 });

  const [emailSectors, setEmailSectors] = useState<Record<string, string>>({});
  const [predictionMethods, setPredictionMethods] = useState<Record<string, string>>({});
  const [emailAnalyses, setEmailAnalyses] = useState<Record<string, EmailAnalysis>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchAndProcessEmails() {
      try {
        // Fetch emails
        const res = await fetch("/api/gmail");
        if (!res.ok) throw new Error("Failed to fetch emails");
        const emailsData = await res.json();
        setEmails(emailsData);

        // Auto-select first email if available
        if (emailsData.length > 0) {
          setSelectedEmail(emailsData[0]);
        }

        // QUICK: Only predict sectors initially for all emails
        await predictSectorsOnly(emailsData);
      } catch (err) {
        console.error("Error fetching emails:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAndProcessEmails();
  }, []);

  // Quick sector prediction only with hybrid approach
  const predictSectorsOnly = async (emails: Email[]) => {
    if (emails.length === 0) {
      setProcessingEmails(false);
      return;
    }

    setProcessingEmails(true);
    setProgress(0);

    try {
      const res = await fetch("/api/predict-sectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });

      if (!res.ok) throw new Error("Failed to predict sectors");

      const data = await res.json();

      // Store sectors and methods
      const sectors: Record<string, string> = {};
      const methods: Record<string, string> = {};

      data.sectors.forEach((item: SectorResult) => {
        sectors[item.emailId] = item.sector;
        methods[item.emailId] = item.method;
        setProgress(Math.round(((Object.keys(sectors).length) / emails.length) * 100));
      });

      setEmailSectors(sectors);
      setPredictionMethods(methods);

      // Update stats
      if (data.stats) {
        setPredictionStats({
          total: data.stats.totalEmails,
          gemini: data.stats.geminiRequests,
          keywords: data.stats.keywordMatches
        });
      }
    } catch (err) {
      console.error("Error predicting sectors:", err);
    } finally {
      setProcessingEmails(false);
      setProgress(100);
    }
  };

  // Load full analysis when email is selected
  const loadFullAnalysis = async (emailId: string) => {
    // If we already have the analysis, don't load again
    if (emailAnalyses[emailId]) return;

    setLoadingDetails(prev => ({ ...prev, [emailId]: true }));

    try {
      const email = emails.find(e => e.id === emailId);
      if (!email) return;

      const res = await fetch("/api/process-all-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: [email] }), // Only process the selected email
      });

      if (!res.ok) throw new Error("Failed to load email analysis");

      const data = await res.json();

      if (data.analyses && data.analyses.length > 0) {
        setEmailAnalyses(prev => ({
          ...prev,
          [emailId]: data.analyses[0].analysis
        }));
      }
    } catch (err) {
      console.error("Error loading full analysis:", err);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [emailId]: false }));
    }
  };

  // Single click - select email for preview and load full analysis
  const handleEmailSelect = async (email: Email) => {
    setSelectedEmail(email);

    // Load full analysis when email is selected
    if (!emailAnalyses[email.id]) {
      await loadFullAnalysis(email.id);
    }
  };

  // Double click - navigate to deal detail page
  const handleEmailDoubleClick = (email: Email) => {
    router.push(`/dashboard/investor/deals/${email.id}`);
  };

  // Function to download attachments
  const downloadAttachment = async (attachment: any, emailSubject: string) => {
    try {
      if (attachment.url) {
        const res = await fetch(attachment.url);
        if (!res.ok) throw new Error('Failed to download attachment');

        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = attachment.filename || attachment.name || 'attachment';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        return;
      }

      // Fallback logic if needed
      console.warn('No attachment URL found');
    } catch (error) {
      console.error('Error downloading attachment:', error);
      alert('Failed to download attachment. Please try again.');
    }
  };

  // Function to get file icon based on file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  // Function to get prediction method badge
  // Function to get prediction method badge
  const getMethodBadge = (method: string) => {
    if (method === 'keywords') {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Fast</Badge>;
    } else if (method === 'gemini') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">AI</Badge>;
    } else if (method === 'fallback' || method === 'error_fallback') {
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">Basic</Badge>;
    }
    return null;
  };

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "unread" && !email.isRead) ||
      (activeFilter === "starred" && email.isStarred) ||
      email.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex h-screen">
        <InvestorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
            <p className="text-muted-foreground text-lg">Loading Inbox...</p>
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
        <div className={`${selectedEmail ? "w-2/3" : "w-full"} overflow-auto border-r bg-white transition-all`}>
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-white">
            <div className="flex h-16 items-center justify-between px-8">
              <div>
                <h1 className="text-2xl font-bold">Inbox</h1>
                <p className="text-sm text-gray-600">
                  {processingEmails ? (
                    <span className="text-blue-600">Analyzing sectors... {progress}%</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      Ready! {predictionStats.keywords}/{predictionStats.total} predicted instantly
                    </span>
                  )}
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
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Sector</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Relevance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredEmails.map((email) => (
                    <tr
                      key={email.id}
                      onClick={() => handleEmailSelect(email)}
                      onDoubleClick={() => handleEmailDoubleClick(email)}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${selectedEmail?.id === email.id ? "bg-emerald-50" : ""
                        }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{email.from}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          {processingEmails && !emailSectors[email.id] ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border border-blue-500 border-t-transparent"></div>
                              <span className="text-gray-400">Analyzing...</span>
                            </div>
                          ) : emailSectors[email.id] ? (
                            <>
                              {emailSectors[email.id]}
                              {getMethodBadge(predictionMethods[email.id])}
                            </>
                          ) : (
                            <span className="text-gray-400">Unknown</span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Progress value={email.startup?.relevanceScore || 0} className="h-2 w-24" />
                          <span className="text-sm font-medium">{email.startup?.relevanceScore || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`${email?.status == "Contacted" ? "bg-blue-100 text-blue-700" :
                            email?.status == "Under Evaluation" ? "bg-yellow-100 text-yellow-700" :
                              email?.status == "Pending" ? "bg-red-100 text-red-700" :
                                email?.status == "New" ? "bg-emerald-100 text-emerald-700" : ""
                          }`}>
                          {email.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Email Detail Panel */}
        {selectedEmail && (
          <div className="w-1/3 overflow-auto bg-white p-6">
            {emailAnalyses[selectedEmail.id] ? (
              <>
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedEmail.subject}</h2>
                    <p className="text-sm text-gray-600 mt-1">{selectedEmail.from}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(selectedEmail.timestamp).toLocaleString()}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedEmail(null)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <Tabs defaultValue="pitch-deck" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pitch-deck">Pitch Deck</TabsTrigger>
                    <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                  </TabsList>

                  {/* Pitch Deck Tab */}
                  <TabsContent value="pitch-deck" className="space-y-6">
                    {/* Pitch Deck Preview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Pitch Deck Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 flex h-48 items-center justify-center rounded-lg bg-gray-100">
                          <p className="text-gray-400">Pitch Deck Preview</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Executive Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Executive Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {emailAnalyses[selectedEmail.id].summary}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
                        Accept
                      </Button>
                      <Button variant="outline" className="flex-1 hover:bg-red-50 hover:text-red-700 cursor-pointer">
                        Reject
                      </Button>
                    </div>

                    {/* Download Attachments Button */}
                    {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                      <Button
                        onClick={() => setAttachmentModalOpen(true)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Attachments ({selectedEmail.attachments.length})
                      </Button>
                    )}
                  </TabsContent>

                  {/* AI Insights Tab */}
                  <TabsContent value="ai-insights" className="space-y-6">
                    {/* Competitive Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <BarChart3 className="h-5 w-5 text-purple-600" />
                          Competitive Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {emailAnalyses[selectedEmail.id].competitiveAnalysis.slice(0, 3).map((point, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${point.toLowerCase().includes('advantage') || point.toLowerCase().includes('strength')
                                  ? 'bg-green-500'
                                  : point.toLowerCase().includes('weakness') || point.toLowerCase().includes('challenge')
                                    ? 'bg-red-500'
                                    : 'bg-blue-500'
                                }`} />
                              <span className="text-sm text-gray-700">{point}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Market Research */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <TrendingUp className="h-5 w-5 text-orange-600" />
                          Market Research
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {emailAnalyses[selectedEmail.id].marketResearch}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="text-center">
                  {loadingDetails[selectedEmail.id] ? (
                    <>
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Full Analysis</h3>
                      <p className="text-gray-600 text-center max-w-sm">
                        Loading detailed AI insights for this email...
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Quick Preview</h3>
                      <p className="text-gray-600 text-center max-w-sm mb-4">
                        Sector: <strong>{emailSectors[selectedEmail.id] || "Unknown"}</strong>
                        {predictionMethods[selectedEmail.id] === 'keywords' && (
                          <Badge className="ml-2 bg-green-100 text-green-700">Fast Prediction</Badge>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                        Click the button below to load comprehensive AI analysis including competitive analysis, market research, and executive summary.
                      </p>
                      <Button
                        onClick={() => loadFullAnalysis(selectedEmail.id)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Load Full AI Analysis
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attachments Modal */}
        <Dialog open={attachmentModalOpen} onOpenChange={setAttachmentModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Download Attachments
              </DialogTitle>
            </DialogHeader>

            {selectedEmail?.attachments && selectedEmail.attachments.length > 0 ? (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedEmail.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => downloadAttachment(attachment, selectedEmail.subject)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(attachment.filename || attachment.name || 'file')}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.filename || attachment.name || `Attachment ${index + 1}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAttachment(attachment, selectedEmail.subject);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      selectedEmail.attachments.forEach(attachment =>
                        downloadAttachment(attachment, selectedEmail.subject)
                      );
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                  <Button variant="outline" onClick={() => setAttachmentModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No attachments available for this email.</p>
                <Button variant="outline" onClick={() => setAttachmentModalOpen(false)} className="mt-4">
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
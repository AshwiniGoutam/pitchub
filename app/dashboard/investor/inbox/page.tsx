"use client";
import { useEffect, useState } from "react";
import { Bell, X, Download, TrendingUp, BarChart3, FileText } from "lucide-react";
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

  const [emailAnalyses, setEmailAnalyses] = useState<Record<string, EmailAnalysis>>({});

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

        // Process ALL emails for accurate sectors
        await processAllEmails(emailsData);
      } catch (err) {
        console.error("Error fetching emails:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAndProcessEmails();
  }, []);

  // Process all emails with full analysis
  const processAllEmails = async (emails: Email[]) => {
    if (emails.length === 0) {
      setProcessingEmails(false);
      return;
    }

    setProcessingEmails(true);
    setProgress(0);

    try {
      const res = await fetch("/api/process-all-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });

      if (!res.ok) throw new Error("Failed to process emails");

      const data = await res.json();
      
      // Store all analyses
      const analyses: Record<string, EmailAnalysis> = {};
      data.analyses.forEach((item: { emailId: string; analysis: EmailAnalysis }) => {
        analyses[item.emailId] = item.analysis;
        // Update progress
        setProgress(Math.round(((Object.keys(analyses).length) / emails.length) * 100));
      });
      
      setEmailAnalyses(analyses);
    } catch (err) {
      console.error("Error processing emails:", err);
    } finally {
      setProcessingEmails(false);
      setProgress(100);
    }
  };

  // Function to download attachments
  const downloadAttachment = async (attachment: any, emailSubject: string) => {
    try {
      // Your existing download logic here
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

      // Your existing fallback logic...
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

  // Single click - select email for preview
  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
  };

  // Double click - navigate to deal detail page
  const handleEmailDoubleClick = (email: Email) => {
    router.push(`/dashboard/investor/deals/${email.id}`);
  };

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
        {/* Inbox List - Keeping your existing structure */}
        <div className={`${selectedEmail ? "w-2/3" : "w-full"} overflow-auto border-r bg-white transition-all`}>
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-white">
            <div className="flex h-16 items-center justify-between px-8">
              <div>
                <h1 className="text-2xl font-bold">Inbox</h1>
                <p className="text-sm text-gray-600">
                  An overview of your deal flow activity.
                  {processingEmails && (
                    <span className="ml-2 text-blue-600">Analyzing sectors... {progress}%</span>
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
                  {filteredEmails.map((email) => {
                    const analysis = emailAnalyses[email.id];
                    const hasAnalysis = !!analysis;
                    
                    return (
                      <tr
                        key={email.id}
                        onClick={() => handleEmailSelect(email)}
                        onDoubleClick={() => handleEmailDoubleClick(email)}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedEmail?.id === email.id ? "bg-emerald-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{email.from}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {processingEmails && !hasAnalysis ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border border-blue-500 border-t-transparent"></div>
                              <span className="text-gray-400">Analyzing...</span>
                            </div>
                          ) : hasAnalysis ? (
                            analysis.sector
                          ) : (
                            <span className="text-gray-400">Unknown</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Progress value={email.startup?.relevanceScore || 0} className="h-2 w-24" />
                            <span className="text-sm font-medium">{email.startup?.relevanceScore || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${
                            email?.status == "Contacted" ? "bg-blue-100 text-blue-700" :
                            email?.status == "Under Evaluation" ? "bg-yellow-100 text-yellow-700" :
                            email?.status == "Pending" ? "bg-red-100 text-red-700" :
                            email?.status == "New" ? "bg-emerald-100 text-emerald-700" : ""
                          }`}>
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
                  
                  {/* Pitch Deck Tab - ONLY: Pitch Deck Preview + Executive Summary */}
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

                  {/* AI Insights Tab - ONLY: Competitive Analysis and Market Research (Short) */}
                  <TabsContent value="ai-insights" className="space-y-6">
                    {/* Competitive Analysis - Short */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <BarChart3 className="h-5 w-5 text-purple-600" />
                          Competitive Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {emailAnalyses[selectedEmail.id]?.competitiveAnalysis?.slice(0, 3).map((point, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                point.toLowerCase().includes('advantage') || point.toLowerCase().includes('strength') 
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

                    {/* Market Research - Short */}
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
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Analyzing Email</h3>
                  <p className="text-gray-600 text-center max-w-sm">
                    This email is still being processed. Please wait while we generate comprehensive AI insights.
                  </p>
                  <div className="mt-6 w-full max-w-xs">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Processing...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attachments Modal - Keeping your existing modal */}
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
"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, X, Download, TrendingUp, BarChart3, FileText, Zap, ChevronLeft, ChevronRight, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { InvestorSidebar } from "@/components/investor-sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

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

interface EmailsResponse {
  emails: Email[];
  total: number;
  page: number;
  limit: number;
}

interface InvestorThesis {
  sectors: string[];
  stages: string[];
  checkSizeMin: number;
  checkSizeMax: number;
  geographies: string[];
  keywords: string[];
  excludedKeywords: string[];
}

// Fetch emails with React Query
const fetchEmails = async (page: number, limit: number): Promise<EmailsResponse> => {
  const res = await fetch(`/api/gmail?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch emails");
  return res.json();
};

// Predict sectors for emails
const predictSectors = async (emails: Email[]): Promise<{ sectors: SectorResult[]; stats: any }> => {
  const res = await fetch("/api/predict-sectors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emails }),
  });
  if (!res.ok) throw new Error("Failed to predict sectors");
  return res.json();
};

// Fetch investor thesis for relevance calculation
const fetchInvestorThesis = async (): Promise<InvestorThesis> => {
  const res = await fetch("/api/investor/thesis");
  if (!res.ok) throw new Error("Failed to fetch investor thesis");
  return res.json();
};

export default function InboxPage() {
  const router = useRouter();

  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [downloadingAttachments, setDownloadingAttachments] = useState<Set<string>>(new Set());
  const [downloadedAttachments, setDownloadedAttachments] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [emailsPerPage] = useState(10);

  // React Query for investor thesis
  const {
    data: thesisData,
    isLoading: thesisLoading,
  } = useQuery({
    queryKey: ['thesis'],
    queryFn: fetchInvestorThesis,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // React Query for emails
  const {
    data: emailsData,
    isLoading: emailsLoading,
    error: emailsError,
  } = useQuery({
    queryKey: ['emails', currentPage, emailsPerPage],
    queryFn: () => fetchEmails(currentPage, emailsPerPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const emails = emailsData?.emails || [];
  const totalEmails = emailsData?.total || 0;

  // React Query for sector prediction
  const {
    data: sectorsData,
    isLoading: sectorsLoading,
  } = useQuery({
    queryKey: ['sectors', currentPage],
    queryFn: () => predictSectors(emails),
    enabled: !!emails.length,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const emailSectors = sectorsData?.sectors?.reduce((acc, item) => {
    acc[item.emailId] = item.sector;
    return acc;
  }, {} as Record<string, string>) || {};

  // Calculate relevance scores based on investor thesis
  const calculateRelevanceScore = (email: Email): number => {
    if (!thesisData) return email.startup?.relevanceScore || 0;

    const text = (email.subject + " " + email.content).toLowerCase();
    let score = 0;
    let maxScore = 0;

    // 🎯 Sector match
    maxScore += 30;
    if (thesisData.sectors?.some((s: string) => 
      emailSectors[email.id]?.toLowerCase().includes(s.toLowerCase())
    )) {
      score += 30;
    }

    // 🔑 Keyword match
    maxScore += 40;
    if (thesisData.keywords?.length) {
      const keywordMatches = thesisData.keywords.filter((kw: string) =>
        text.includes(kw.toLowerCase())
      ).length;
      score += Math.min(40, (keywordMatches / thesisData.keywords.length) * 40);
    }

    // 🚫 Excluded keyword penalty
    if (thesisData.excludedKeywords?.length) {
      const excludedMatches = thesisData.excludedKeywords.filter((kw: string) =>
        text.includes(kw.toLowerCase())
      ).length;
      score -= excludedMatches * 15;
    }

    // 🌍 Geography match
    maxScore += 20;
    if (thesisData.geographies?.length) {
      const geoMatches = thesisData.geographies.filter((g: string) =>
        text.includes(g.toLowerCase())
      ).length;
      score += Math.min(20, (geoMatches / thesisData.geographies.length) * 20);
    }

    // Stage match
    maxScore += 10;
    if (thesisData.stages?.some((s: string) => 
      email.startup?.stage?.toLowerCase().includes(s.toLowerCase())
    )) {
      score += 10;
    }

    const relevance = Math.max(0, Math.min(100, (score / maxScore) * 100));
    return Math.round(relevance);
  };

  const [emailAnalyses, setEmailAnalyses] = useState<Record<string, EmailAnalysis>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});

  // Format date to show full date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Load full analysis when email is selected
  const loadFullAnalysis = async (emailId: string) => {
    if (emailAnalyses[emailId]) return;

    setLoadingDetails(prev => ({ ...prev, [emailId]: true }));

    try {
      const email = emails.find(e => e.id === emailId);
      if (!email) return;

      const res = await fetch("/api/process-all-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: [email] }),
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

    if (!emailAnalyses[email.id]) {
      await loadFullAnalysis(email.id);
    }
  };

  // Double click - navigate to deal detail page
  const handleEmailDoubleClick = (email: Email) => {
    router.push(`/dashboard/investor/deals/${email.id}`);
  };

  // Helper function to get file extension from mime type
  const getFileExtension = (mimeType: string) => {
    const extensions: { [key: string]: string } = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-powerpoint': 'ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'text/plain': 'txt',
      'text/csv': 'csv',
    };
    
    return extensions[mimeType] || 'file';
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

  // Enhanced download function with better feedback
  const downloadAttachment = async (attachment: any, emailSubject: string) => {
    const attachmentId = attachment.id || attachment.filename;
    
    // Check if already downloading
    if (downloadingAttachments.has(attachmentId)) {
      return;
    }

    // Add to downloading set
    setDownloadingAttachments(prev => new Set(prev).add(attachmentId));
    
    try {
      // Show immediate feedback
      toast.info(`Starting download: ${attachment.filename || attachment.name}`);

      let downloadUrl = attachment.url;
      
      // If no URL, try to construct one
      if (!downloadUrl && attachment.id && selectedEmail?.id) {
        downloadUrl = `/api/gmail/attachments/${selectedEmail.id}/${attachment.id}`;
      }

      if (!downloadUrl) {
        throw new Error('No download URL available');
      }

      const res = await fetch(downloadUrl);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Download failed: ${res.status} ${errorText}`);
      }

      const blob = await res.blob();
      
      // Check if blob is valid
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use attachment filename
      const contentDisposition = res.headers.get('content-disposition');
      let filename = attachment.filename || attachment.name || 'attachment';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Ensure file extension
      if (!filename.includes('.')) {
        const ext = getFileExtension(attachment.mimeType);
        filename = `${filename}.${ext}`;
      }
      
      link.download = filename;
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Mark as downloaded
      setDownloadedAttachments(prev => new Set(prev).add(attachmentId));
      
      // Show success message
      toast.success(`Downloaded: ${filename}`);
      
    } catch (error) {
      console.error('Error downloading attachment:', error);
      
      // Show error message
      toast.error(`Failed to download: ${attachment.filename || attachment.name}`, {
        description: error.message
      });
      
    } finally {
      // Remove from downloading set
      setDownloadingAttachments(prev => {
        const newSet = new Set(prev);
        newSet.delete(attachmentId);
        return newSet;
      });
    }
  };

  // Enhanced file icon with download status
  const getFileIconWithStatus = (attachment: any) => {
    const attachmentId = attachment.id || attachment.filename;
    const isDownloading = downloadingAttachments.has(attachmentId);
    const isDownloaded = downloadedAttachments.has(attachmentId);
    
    let icon = getFileIcon(attachment.filename || attachment.name || 'file');
    
    // Add status indicator
    return (
      <div className="relative">
        {icon}
        {isDownloading && (
          <div className="absolute -top-1 -right-1">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
        {isDownloaded && (
          <div className="absolute -top-1 -right-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
          </div>
        )}
      </div>
    );
  };

  // Download all attachments
  const downloadAllAttachments = async () => {
    if (!selectedEmail?.attachments?.length) return;
    
    toast.info(`Starting download of ${selectedEmail.attachments.length} files...`);
    
    // Download sequentially to avoid overwhelming the browser
    for (let i = 0; i < selectedEmail.attachments.length; i++) {
      const attachment = selectedEmail.attachments[i];
      await downloadAttachment(attachment, selectedEmail.subject);
      
      // Small delay between downloads
      if (i < selectedEmail.attachments.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    toast.success(`All downloads completed!`);
  };

  // Enhanced attachment item component
  const AttachmentItem = ({ attachment, index }: { attachment: any, index: number }) => {
    const attachmentId = attachment.id || attachment.filename;
    const isDownloading = downloadingAttachments.has(attachmentId);
    const isDownloaded = downloadedAttachments.has(attachmentId);
    
    return (
      <div
        key={index}
        className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${
          isDownloading 
            ? 'bg-blue-50 border-blue-200' 
            : isDownloaded
            ? 'bg-green-50 border-green-200'
            : 'hover:bg-gray-50 cursor-pointer'
        }`}
        onClick={() => !isDownloading && downloadAttachment(attachment, selectedEmail?.subject || '')}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {getFileIconWithStatus(attachment)}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {attachment.filename || attachment.name || `Attachment ${index + 1}`}
            </p>
            <p className="text-xs text-gray-500">
              {attachment.size} • {attachment.mimeType || 'Unknown type'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={isDownloading}
          onClick={(e) => {
            e.stopPropagation();
            downloadAttachment(attachment, selectedEmail?.subject || '');
          }}
          className={isDownloading ? "opacity-50 cursor-not-allowed" : ""}
        >
          {isDownloading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalEmails / emailsPerPage);
  const startIndex = (currentPage - 1) * emailsPerPage;
  const endIndex = startIndex + emailsPerPage;

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

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(page);
    setSelectedEmail(null); // Close sidebar when changing pages
  };

  // Show loading until sectors are predicted for current page
  const showLoading = emailsLoading || (emails.length > 0 && sectorsLoading) || thesisLoading;

  if (showLoading) {
    return (
      <div className="flex h-screen">
        <InvestorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
            <p className="text-muted-foreground text-lg">
              {emailsLoading ? "Loading emails..." : "Analyzing sectors..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (emailsError) {
    return (
      <div className="flex h-screen">
        <InvestorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg">Error loading emails</p>
            <Button 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <InvestorSidebar />

      <div className="flex flex-1 overflow-hidden">
        {/* Inbox List - Fixed width that doesn't shrink */}
        <div className={`${selectedEmail ? "w-2/3" : "w-full"} overflow-auto border-r bg-white transition-all`}>
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-white">
            <div className="flex h-16 items-center justify-between px-8">
              <div>
                <h1 className="text-2xl font-bold">Inbox</h1>
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalEmails)} of {totalEmails} emails
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Table with fixed column widths */}
          <div className="p-8">
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-1/5">From</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-1/6">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-1/5">Sector</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-1/5">Relevance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-1/6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredEmails.map((email) => {
                    const relevanceScore = calculateRelevanceScore(email);
                    
                    return (
                      <tr
                        key={email.id}
                        onClick={() => handleEmailSelect(email)}
                        onDoubleClick={() => handleEmailDoubleClick(email)}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 ${selectedEmail?.id === email.id ? "bg-emerald-50" : ""
                          }`}
                      >
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap truncate max-w-[200px]">
                          {email.from}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(email.timestamp)}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[120px]">
                              {emailSectors[email.id] || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Progress value={relevanceScore} className="h-2 w-20" />
                            <span className="text-sm font-medium min-w-[40px]">{relevanceScore}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={`${email?.status == "Contacted" ? "bg-blue-100 text-blue-700" :
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalEmails)} of {totalEmails} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Detail Panel - Only show when an email is selected */}
        {selectedEmail && (
          <div className="w-1/3 overflow-auto bg-white p-6 border-l">
            {emailAnalyses[selectedEmail.id] ? (
              <>
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{selectedEmail.subject}</h2>
                    {/* Name removed from sidebar as requested */}
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
                          {emailAnalyses[selectedEmail.id]?.competitiveAnalysis?.slice(0, 3).map((point, index) => (
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

        {/* Enhanced Attachments Modal */}
        <Dialog open={attachmentModalOpen} onOpenChange={setAttachmentModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Attachments
                {selectedEmail?.attachments && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedEmail.attachments.length} files
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Click on any file to download it individually, or use "Download All" for all files.
              </DialogDescription>
            </DialogHeader>

            {selectedEmail?.attachments && selectedEmail.attachments.length > 0 ? (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedEmail.attachments.map((attachment, index) => (
                    <AttachmentItem 
                      key={attachment.id || index}
                      attachment={attachment}
                      index={index}
                    />
                  ))}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={downloadAllAttachments}
                    disabled={downloadingAttachments.size > 0}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {downloadingAttachments.size > 0 ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download All ({selectedEmail.attachments.length})
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setAttachmentModalOpen(false)}
                    disabled={downloadingAttachments.size > 0}
                  >
                    Close
                  </Button>
                </div>

                {/* Download progress indicator */}
                {downloadingAttachments.size > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                      <span>Downloading {downloadingAttachments.size} file(s)...</span>
                    </div>
                    <Progress 
                      value={(downloadedAttachments.size / selectedEmail.attachments.length) * 100} 
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {downloadedAttachments.size} of {selectedEmail.attachments.length} completed
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
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
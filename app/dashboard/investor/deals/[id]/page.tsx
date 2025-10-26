"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { InvestorSidebar } from "@/components/investor-sidebar";
import { Bell, ChevronRight, FileText, Download, Eye, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface EmailData {
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

interface EmailsResponse {
  emails: EmailData[];
  total: number;
  page: number;
  limit: number;
}

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [notes, setNotes] = useState("")
  const [emailData, setEmailData] = useState<EmailData | null>(null)
  const [emailAnalysis, setEmailAnalysis] = useState<EmailAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false)

  // Fetch email data based on ID
  useEffect(() => {
    async function fetchEmailData() {
      try {
        const emailId = params.id as string;
        
        // Fetch all emails without pagination to find the specific one
        const res = await fetch("/api/gmail?page=1&limit=1000"); // Large limit to get all emails
        if (!res.ok) throw new Error("Failed to fetch emails");
        const data: EmailsResponse = await res.json();
        
        const foundEmail = data.emails.find((email: EmailData) => email.id === emailId);
        if (foundEmail) {
          setEmailData(foundEmail);
          
          // Fetch analysis for this email
          const analysisRes = await fetch("/api/process-all-emails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emails: [foundEmail] }),
          });
          
          if (analysisRes.ok) {
            const analysisData = await analysisRes.json();
            if (analysisData.analyses && analysisData.analyses.length > 0) {
              // Ensure the analysis has all required fields with fallbacks
              const analysis = analysisData.analyses[0].analysis;
              setEmailAnalysis({
                summary: analysis.summary || "No summary available.",
                sector: analysis.sector || "SaaS",
                competitiveAnalysis: Array.isArray(analysis.competitiveAnalysis) ? analysis.competitiveAnalysis : [
                  "Higher efficiency than current market leaders.",
                  "Manufacturing costs are currently higher."
                ],
                marketResearch: analysis.marketResearch || "Market analysis not available.",
                fundingMentioned: analysis.fundingMentioned || false,
                growthStage: analysis.growthStage || "Early"
              });
            } else {
              // Set default analysis if none returned
              setEmailAnalysis({
                summary: "Analysis in progress...",
                sector: "SaaS",
                competitiveAnalysis: [
                  "Higher efficiency than current market leaders.",
                  "Manufacturing costs are currently higher."
                ],
                marketResearch: "The SaaS market is projected to grow by 15% annually.",
                fundingMentioned: false,
                growthStage: "Early"
              });
            }
          } else {
            // Set default analysis if API call fails
            setEmailAnalysis({
              summary: "Unable to generate analysis at this time.",
              sector: "SaaS",
              competitiveAnalysis: [
                "Higher efficiency than current market leaders.",
                "Manufacturing costs are currently higher."
              ],
              marketResearch: "Market analysis not available.",
              fundingMentioned: false,
              growthStage: "Early"
            });
          }
        } else {
          console.error("Email not found with ID:", emailId);
        }
      } catch (err) {
        console.error("Error fetching email data:", err);
        // Set default analysis on error
        setEmailAnalysis({
          summary: "Error loading analysis.",
          sector: "SaaS",
          competitiveAnalysis: [
            "Higher efficiency than current market leaders.",
            "Manufacturing costs are currently higher."
          ],
          marketResearch: "Market analysis not available.",
          fundingMentioned: false,
          growthStage: "Early"
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (params.id) {
      fetchEmailData();
    }
  }, [params.id])

  // Function to download attachments
  const downloadAttachment = async (attachment: any) => {
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

      if (attachment.data) {
        const binaryString = atob(attachment.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: attachment.mimeType || 'application/octet-stream' });
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

      throw new Error('No valid attachment data found');
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
      case 'ppt':
      case 'pptx':
        return <FileText className="h-8 w-8 text-orange-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  // Find PDF attachments for preview
  const getPdfAttachments = (email: EmailData | null) => {
    if (!email?.attachments) return [];
    return email.attachments.filter(attachment => 
      attachment.mimeType === 'application/pdf' || 
      attachment.filename?.toLowerCase().endsWith('.pdf') ||
      attachment.name?.toLowerCase().endsWith('.pdf')
    );
  };

  const pdfAttachments = getPdfAttachments(emailData);
  const firstPdf = pdfAttachments[0];

  // Get funding stage from email content or use default
  const getFundingStage = () => {
    if (emailAnalysis?.growthStage) {
      return emailAnalysis.growthStage === "Early" ? "Seed" : 
             emailAnalysis.growthStage === "Expansion" ? "Series A" : 
             emailAnalysis.growthStage === "Mature" ? "Series B+" : "Seed";
    }
    return "Seed";
  };

  // Extract company name from subject
  const getCompanyName = () => {
    if (emailData?.subject) {
      // Try to extract company name from subject
      const subject = emailData.subject;
      // Remove common prefixes and get first few words
      const cleanSubject = subject.replace(/^(Pitch|Deal|Investment|Startup):?\s*/i, '');
      return cleanSubject.split(' - ')[0] || cleanSubject.split(' | ')[0] || emailData.subject;
    }
    return emailData?.subject || "Unknown Company";
  };

  // Safe competitive analysis getter
  const getCompetitiveAnalysis = () => {
    if (!emailAnalysis?.competitiveAnalysis || !Array.isArray(emailAnalysis.competitiveAnalysis)) {
      return [
        "Higher efficiency than current market leaders.",
        "Manufacturing costs are currently higher."
      ];
    }
    return emailAnalysis.competitiveAnalysis.slice(0, 3);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <InvestorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
            <p className="text-muted-foreground text-lg">Loading Deal Details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!emailData) {
    return (
      <div className="flex h-screen bg-gray-50">
        <InvestorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Deal Not Found</h2>
            <p className="text-gray-600 mb-4">The requested deal could not be found.</p>
            <Button onClick={() => router.push('/dashboard/investor/inbox')} className="bg-emerald-600 hover:bg-emerald-700">
              Back to Inbox
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <InvestorSidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-white">
          <div className="flex h-16 items-center justify-between px-8">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button onClick={() => router.push("/dashboard/investor/inbox")} className="hover:text-gray-900">
                Inbox
              </button>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900">{getCompanyName()}</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search..."
                className="rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                <img src="/placeholder.svg?height=40&width=40" alt="User" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Title and Actions */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">{getCompanyName()}</h1>
              <p className="text-gray-600">
                {getFundingStage()} Stage | {emailAnalysis?.sector || "SaaS"} | Seeking $2M
              </p>
              <Badge className={`mt-2 ${
                emailData?.status == "Contacted" ? "bg-blue-100 text-blue-700" :
                emailData?.status == "Under Evaluation" ? "bg-yellow-100 text-yellow-700" :
                emailData?.status == "Pending" ? "bg-red-100 text-red-700" :
                emailData?.status == "New" ? "bg-emerald-100 text-emerald-700" : ""
              }`}>
                {emailData.status}
              </Badge>
            </div>
            <div className="flex gap-3">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Schedule Meeting</Button>
              <Button className="bg-emerald-600">Request Data</Button>
              <Button variant="outline">Decline</Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - 2/3 width */}
            <div className="space-y-6 lg:col-span-2">
              {/* Pitch Deck */}
              <Card className="py-1">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-bold">Pitch Deck</h2>
                  <div className="rounded-lg border bg-gray-50 p-6">
                    {firstPdf ? (
                      <div className="flex flex-col items-center">
                        <div className="mb-4 flex items-center gap-4 w-full">
                          <div className="flex h-32 w-24 items-center justify-center rounded border bg-white">
                            <iframe 
                              src={`${firstPdf.url}#view=fitH&page=1&toolbar=0&navpanes=0`}
                              className="w-full h-full border-0 rounded"
                              title="Pitch Deck Preview"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-1 font-semibold">{getCompanyName()} Pitch Deck</h3>
                            <p className="text-sm text-gray-600">First page preview</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadAttachment(firstPdf)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Full PDF
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="flex h-32 w-24 items-center justify-center rounded border bg-white">
                          <FileText className="h-12 w-12 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 font-semibold">{getCompanyName()} Pitch Deck</h3>
                          <p className="text-sm text-gray-600">No pitch deck available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Deal Summary */}
              <Card>
                <CardContent className="p-6 py-1">
                  <h2 className="mb-4 text-xl font-bold">Deal Summary</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {emailAnalysis?.summary || `${getCompanyName()} is a ${emailAnalysis?.sector || "SaaS"} company seeking funding. ${emailData.content.substring(0, 200)}...`}
                  </p>
                </CardContent>
              </Card>

              {/* Competitive Analysis */}
              <Card>
                <CardContent className="p-6 py-1">
                  <h3 className="mb-4 text-xl font-bold">Competitive Analysis</h3>
                  <div className="space-y-3">
                    {getCompetitiveAnalysis().map((point, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className={`mt-1 h-2 w-2 rounded-full ${
                          point.toLowerCase().includes('advantage') || point.toLowerCase().includes('strength') 
                            ? 'bg-emerald-500' 
                            : point.toLowerCase().includes('weakness') || point.toLowerCase().includes('challenge')
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`} />
                        <p className="text-sm text-gray-600">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Market Research */}
              <Card>
                <CardContent className="p-6 py-1">
                  <h2 className="mb-4 text-xl font-bold">Market Research</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {emailAnalysis?.marketResearch || `The ${emailAnalysis?.sector || "SaaS"} market is projected to grow by 15% annually. Market trends indicate strong potential for innovative solutions in this space.`}
                  </p>
                </CardContent>
              </Card>

              {/* Internal Notes */}
              <Card>
                <CardContent className="p-6 py-1">
                  <h2 className="mb-4 text-xl font-bold">Internal Notes</h2>
                  <Textarea
                    placeholder="Add notes for your team"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                  <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">Save Notes</Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              <Card className="py-1">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-bold">Key Information</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Sector</span>
                      <span className="font-medium">{emailAnalysis?.sector || "SaaS"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Stage</span>
                      <span className="font-medium">{getFundingStage()}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Funding Requirement</span>
                      <span className="font-medium">$2M</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Valuation</span>
                      <span className="font-medium">$10M</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Lead Investor</span>
                      <span className="font-medium">Not disclosed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact</span>
                      <span className="font-medium">{emailData.from}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Download Attachments Card */}
              {emailData.attachments && emailData.attachments.length > 0 && (
                <Card className="py-1">
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-xl font-bold">Attachments</h2>
                    <Button 
                      onClick={() => setAttachmentModalOpen(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download All Attachments ({emailData.attachments.length})
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attachments Modal */}
      <Dialog open={attachmentModalOpen} onOpenChange={setAttachmentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Email Attachments
            </DialogTitle>
          </DialogHeader>
          
          {emailData?.attachments && emailData.attachments.length > 0 ? (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {emailData.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => downloadAttachment(attachment)}
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
                        downloadAttachment(attachment);
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
                    emailData.attachments.forEach(attachment => 
                      downloadAttachment(attachment)
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
  )
}
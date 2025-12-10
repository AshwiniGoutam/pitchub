"use client";
import React, { useState, useEffect } from "react";
import { InvestorSidebar } from "@/components/investor-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Bell, Download, Mail } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import QRCode from "qrcode";
import { MatchingEngine } from "@/lib/matching-engine";

export default function Page() {
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [Clicked, setClicked] = useState(false);

  const [emailContent, setEmailContent] = useState({
    to: "",
    subject: "",
    body: "",
  });

  const [Loading, setLoading] = useState(false);
  const [scannerLink, setScannerLink] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const [investorThesis, setInvestorThesis] = useState(null);
  const [leads, setLeads] = useState([]);
  const [ScannerModal, setScannerModal] = useState(false);

  // -------------------------------------
  // LOAD SCANNER LINK + QR
  // -------------------------------------
  useEffect(() => {
    const generateLink = async () => {
      const res = await fetch("/api/investor/scanner-link");
      const data = await res.json();
      setScannerLink(data.link);

      const qr = await QRCode.toDataURL(data.link);
      setQrUrl(qr);
    };
    generateLink();
  }, []);

  // -------------------------------------
  // LOAD INVESTOR THESIS (FIXED)
  // -------------------------------------
  const fetchInvestorThesis = async () => {
    try {
      const res = await fetch("/api/investor/thesis", { cache: "no-store" });

      if (!res.ok) throw new Error("Thesis fetch failed");

      const thesis = await res.json();

      // SAFETY CHECK — ensure structure stays consistent
      const safeThesis = {
        sectors: thesis.sectors || [],
        stages: thesis.stages || [],
        checkSizeMin: thesis.checkSizeMin || 0,
        checkSizeMax: thesis.checkSizeMax || 0,
        geographies: thesis.geographies || [],
        keywords: thesis.keywords || [],
        excludedKeywords: thesis.excludedKeywords || [],
      };

      console.log("THESIS LOADED:", safeThesis);
      setInvestorThesis(safeThesis);
    } catch (err) {
      console.error("❌ Thesis Error:", err);

      const fallback = {
        sectors: [],
        stages: [],
        checkSizeMin: 0,
        checkSizeMax: 0,
        geographies: [],
        keywords: [],
        excludedKeywords: [],
      };
      setInvestorThesis(fallback);
    }
  };

  useEffect(() => {
    fetchInvestorThesis();
  }, []);

  // Normalize startup fields coming from server
  function normalizeStartup(raw) {
    if (!raw) return raw;

    // defensive copies
    const startup = { ...raw };

    // Convert createdAt / updatedAt (which may be strings) to Date objects
    try {
      startup.createdAt =
        raw.createdAt instanceof Date ? raw.createdAt : new Date(raw.createdAt);
    } catch (e) {
      startup.createdAt = new Date(); // fallback
    }

    try {
      startup.updatedAt =
        raw.updatedAt instanceof Date ? raw.updatedAt : new Date(raw.updatedAt);
    } catch (e) {
      startup.updatedAt = new Date();
    }

    // Ensure fundingRequirement numbers (if used) are actual numbers
    if (startup.fundingRequirement) {
      const fr = startup.fundingRequirement;
      startup.fundingRequirement = {
        min: typeof fr.min === "number" ? fr.min : Number(fr.min) || 0,
        max: typeof fr.max === "number" ? fr.max : Number(fr.max) || 0,
      };
    }

    // Ensure relevanceScore is numeric
    if (startup.relevanceScore != null) {
      startup.relevanceScore = Number(startup.relevanceScore) || 0;
    }
    return startup;
  }

  // -------------------------------------
  // LOAD LEADS AFTER THESIS LOADED
  // -------------------------------------
  useEffect(() => {
    if (!investorThesis) return; // wait until thesis is loaded

    const fetchLeads = async () => {
      try {
        const res = await fetch("/api/investor/my-leads", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch leads");

        const raw = await res.json();

        // Normalize every startup BEFORE passing to MatchingEngine
        const normalized = raw.map((s) => normalizeStartup(s));

        // Now compute relevance score safely (MatchingEngine expects Date objects)
        const updated = normalized.map((startup) => {
          // MatchingEngine.calculateRelevanceScore should accept the normalized startup
          const { score } = MatchingEngine.calculateRelevanceScore(
            startup,
            investorThesis
          );
          return { ...startup, relevanceScore: Number(score) || 0 };
        });
        console.log("0000000000", updated);

        setLeads(updated);
      } catch (err) {
        console.error("Leads Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [investorThesis]);

  // -------------------------------------
  // SEND EMAIL
  // -------------------------------------
  const sendEmail = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...emailContent,
          startupId: selectedStartup?._id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert("Error: " + data.message);
        return;
      }

      await fetch(`/api/investor/startups/${selectedStartup?._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "contacted" }),
      });

      setLoading(false);
      setIsEmailModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error sending email");
    }
  };

  // -------------------------------------
  // UI RENDER
  // -------------------------------------
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <InvestorSidebar />

      <div className="flex-1 overflow-auto">
        {/* HEADER */}
        <header className="sticky top-0 z-10 border-b bg-white pr-10">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-bold">Pitch Connects</h1>
              <p className="text-sm text-gray-600">
                An overview of your pitches.
              </p>
            </div>
            <Button
              className="text-xs bg-transparent border  border-gray-300 hover:bg-gray-100 text-gray-800"
              onClick={() => setScannerModal(true)}
            >
              {/* <Bell className="h-5 w-5" /> */}
              Create Scanner
            </Button>
          </div>
        </header>

        {/* LEADS TABLE */}
        <div className="p-8 max-w-7xl mx-auto">
          <div className="py-8">
            {leads.length > 0 ? (
              <div className="overflow-hidden rounded-xl border bg-white">
                <table className="w-full border-collapse">
                  <thead className="bg-emerald-50/60 text-gray-600 text-sm">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Founder
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Relevancy
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {leads.map((startup) => {
                      return (
                        <tr key={startup._id} className="hover:bg-emerald-50">
                          <td className="text-sm px-6 py-4 font-medium">
                            <p>{startup.startupName}</p>
                            <Badge className="mt-1 bg-emerald-100 text-emerald-700">
                              {startup.sector}
                            </Badge>
                          </td>

                          <td className="text-sm px-6 py-4 font-medium">
                            {startup.founderName}
                          </td>

                          <td className="text-sm px-6 py-4 font-medium">
                            {startup.stage}
                          </td>

                          <td className="text-sm px-6 py-4 font-medium">
                            <div className="flex items-center gap-3">
                              <Progress
                                value={startup.relevanceScore}
                                className="h-2 w-24"
                              />
                              <span>{startup.relevanceScore}%</span>
                            </div>
                          </td>

                          <td className="text-sm px-6 py-4 font-medium">
                            <Badge className="bg-white-600 border-gray-300 hover:bg-gray-100 text-gray-800">
                              {startup.status || "Submitted"}
                            </Badge>
                          </td>

                          <td className="text-sm px-6 py-4 font-medium flex gap-2">
                            <Button
                              variant="default"
                              className="text-xs bg-transparent border  border-gray-300 hover:bg-gray-100 text-gray-800"
                              disabled={startup.status === "contacted"}
                              onClick={() => {
                                setSelectedStartup(startup);
                                setEmailContent({
                                  to: startup.email,
                                  subject: `Regarding Investment Opportunity in ${startup.startupName}`,
                                  body: `Hi ${startup.founderName},\n\nI am interested in knowing more about your startup.\n`,
                                });
                                setIsEmailModalOpen(true);
                              }}
                            >
                              {startup.status === "contacted"
                                ? "Mail Sent"
                                : "Mail Founder"}
                            </Button>

                            <Button
                              className="text-xs bg-emerald-600 text-white"
                              onClick={() => {
                                setSelectedStartup(startup);
                                setIsModalOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-gray-500 font-medium">
                <div className="flex-1 flex h-[60vh] items-center justify-center">
                  <div>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
                    <p className="text-xl">Loading Pitches...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Your modals below remain unchanged */}
      {/* === MODALS remain unchanged === */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto p-8 bg-white rounded shadow-2xl">
          {selectedStartup && (
            <>
              <DialogHeader className="border-b pb-4 gap-0">
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {selectedStartup.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  {selectedStartup.sector} • {selectedStartup.stage}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-8 mt-6 text-gray-700">
                <div className="space-y-4">
                  <p>
                    <span className="font-semibold">Location:</span>{" "}
                    {selectedStartup.location || "—"}
                  </p>
                  {/* <p>
                    <span className="font-semibold">Team Size:</span>{" "}
                    {selectedStartup.teamSize || "—"}
                  </p> */}
                  <p>
                    <span className="font-semibold">Funding Requirement:</span>{" "}
                    ₹{selectedStartup.fundingRequirement.min} – ₹
                    {selectedStartup.fundingRequirement.max}
                  </p>
                  <p>
                    <span className="font-semibold">Founder Email:</span>{" "}
                    {selectedStartup.email}
                  </p>
                  <p>
                    <span className="font-semibold">Relevance Score:</span>{" "}
                    {selectedStartup.relevanceScore || 80}%
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    <Badge className="ml-1 bg-blue-100 text-blue-700 capitalize">
                      {selectedStartup.status || "submitted"}
                    </Badge>
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-1 text-lg">Description:</p>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {selectedStartup.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 text-sm text-gray-500 border-t">
                <p>
                  Created:{" "}
                  {new Date(selectedStartup.createdAt).toLocaleString("en-IN")}
                </p>
                <p>
                  Updated:{" "}
                  {new Date(selectedStartup.updatedAt).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="sticky -bottom-8 left-0 right-0 bg-white border-t mt-8 py-4 flex justify-start gap-4">
                {selectedStartup.founderId && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      (window.location.href = `mailto:${selectedStartup.founderId}`)
                    }
                  >
                    <Mail /> Mail Founder
                  </Button>
                )}

                {selectedStartup.pitchDeck && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      window.open(selectedStartup.pitchDeck, "_blank")
                    }
                  >
                    <Download /> Download Pitch Deck
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-lg w-full p-6 bg-white rounded shadow-xl">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>
              Preview your email before sending.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            <div>
              <label className="font-medium text-sm">To:</label>
              <input
                type="email"
                value={emailContent.to}
                readOnly
                className="w-full border px-2 py-1 rounded"
              />
            </div>

            <div>
              <label className="font-medium text-sm">Subject:</label>
              <input
                type="text"
                value={emailContent.subject}
                onChange={(e) =>
                  setEmailContent({ ...emailContent, subject: e.target.value })
                }
                className="w-full border px-2 py-1 rounded"
              />
            </div>

            <div>
              <label className="font-medium text-sm">Body:</label>
              <textarea
                rows={6}
                value={emailContent.body}
                onChange={(e) =>
                  setEmailContent({ ...emailContent, body: e.target.value })
                }
                className="w-full border px-2 py-1 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsEmailModalOpen(false)}
                disabled={Loading}
              >
                Cancel
              </Button>
              <Button onClick={sendEmail}>
                {Loading ? "Sending Email..." : "Send Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* scanner modal */}
      <Dialog open={ScannerModal} onOpenChange={setScannerModal}>
        <DialogContent className="max-w-lg w-full p-6 bg-white rounded shadow-xl">
          <DialogHeader>
            <DialogTitle>Your Scanner</DialogTitle>
            <DialogDescription>
              Send this scanner link or QR to founders to let them submit their
              startups
            </DialogDescription>
          </DialogHeader>

          {/* QR SECTION */}
          <div className="mb-6 flex flex-col items-center justify-center gap-4 px-8 pt-4 border-t">
            {/* QR IMAGE + DOWNLOAD */}
            <div className="flex flex-col items-center gap-2">
              <p className="font-medium mb-1">Your Scanner QR:</p>

              {qrUrl && (
                <>
                  <img src={qrUrl} className="w-32 h-32 border rounded" />

                  {/* DOWNLOAD QR BUTTON */}
                  <a
                    href={qrUrl}
                    download="scanner-qr.png"
                    className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Download QR
                  </a>
                </>
              )}
            </div>

            {/* LINK + COPY */}
            <div className="flex flex-col items-center">
              <p className="font-medium mb-1 text-center">
                Or share this link:
              </p>
              <a
                href={scannerLink}
                className="text-blue-600 underline break-all text-center"
                target="_blank"
              >
                {scannerLink}
              </a>

              {/* COPY LINK BUTTON */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(scannerLink);
                  setClicked(true);
                }}
                className="mt-2 text-sm px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 cursor-pointer"
              >
                {Clicked ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

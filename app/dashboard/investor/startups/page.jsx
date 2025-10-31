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
import { Download, Mail } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ConnectionFilterDropdown from "@/components/ui/ConnectionFilterDropdown";

export default function Page() {
  const [startups, setStartups] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailContent, setEmailContent] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const [Loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Pitch Connect");
  const [deals, setDeals] = useState([]);
  const [investorThesis, setInvestorThesis] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    console.log("Component mounted - fetching data...");
    fetchInvestorThesis();
  }, []);

  // Fetch investor thesis
  const fetchInvestorThesis = async () => {
    try {
      console.log("🔄 Fetching investor thesis...");
      setDebugInfo("Fetching investor thesis...");
      
      const res = await fetch("/api/investor/thesis");
      console.log("Thesis API response status:", res.status);
      
      if (res.ok) {
        const thesis = await res.json();
        console.log("✅ Thesis fetched successfully:", thesis);
        setDebugInfo(`Thesis loaded: ${JSON.stringify(thesis).substring(0, 100)}...`);
        setInvestorThesis(thesis);
        
        // Fetch startups after thesis is loaded
        await fetchStartups(thesis);
      } else {
        console.error("❌ Failed to fetch thesis, status:", res.status);
        setDebugInfo("Failed to fetch thesis, using default");
        // Set a default thesis structure
        const defaultThesis = {
          sectors: [],
          stages: [],
          checkSizeMin: 0,
          checkSizeMax: 0,
          geographies: [],
          keywords: [],
          excludedKeywords: []
        };
        setInvestorThesis(defaultThesis);
        await fetchStartups(defaultThesis);
      }
    } catch (err) {
      console.error("❌ Error fetching investor thesis:", err);
      setDebugInfo("Error fetching thesis");
      const defaultThesis = {
        sectors: [],
        stages: [],
        checkSizeMin: 0,
        checkSizeMax: 0,
        geographies: [],
        keywords: [],
        excludedKeywords: []
      };
      setInvestorThesis(defaultThesis);
      await fetchStartups(defaultThesis);
    }
  };

  // Calculate relevancy score based on investor thesis
  const calculateRelevancyScore = (startup, thesis) => {
    console.log(`📊 Calculating score for: ${startup.name}`, {
      startupSector: startup.sector,
      startupStage: startup.stage,
      startupFunding: startup.fundingRequirement,
      startupLocation: startup.location
    });

    if (!thesis || Object.keys(thesis).length === 0) {
      console.log("⚠️ No thesis available, using default score 50");
      return 50;
    }

    let score = 0;
    let totalWeight = 0;
    const weights = {
      sector: 30,
      stage: 25,
      funding: 20,
      geography: 15,
      keywords: 10,
    };

    console.log("🎯 Thesis criteria:", {
      sectors: thesis.sectors,
      stages: thesis.stages,
      checkSize: { min: thesis.checkSizeMin, max: thesis.checkSizeMax },
      geographies: thesis.geographies,
      keywords: thesis.keywords,
      excludedKeywords: thesis.excludedKeywords
    });

    // Sector matching
    if (thesis.sectors && thesis.sectors.length > 0 && startup.sector) {
      const startupSector = startup.sector.toLowerCase().trim();
      const matchedSector = thesis.sectors.some(
        sector => sector.toLowerCase().trim() === startupSector
      );
      console.log(`🏢 Sector matching: ${startupSector} vs ${thesis.sectors} -> ${matchedSector}`);
      if (matchedSector) {
        score += weights.sector;
        console.log(`✅ Sector matched! +${weights.sector}`);
      }
      totalWeight += weights.sector;
    }

    // Stage matching
    if (thesis.stages && thesis.stages.length > 0 && startup.stage) {
      const startupStage = startup.stage.toLowerCase().trim();
      const matchedStage = thesis.stages.some(
        stage => stage.toLowerCase().trim() === startupStage
      );
      console.log(`📈 Stage matching: ${startupStage} vs ${thesis.stages} -> ${matchedStage}`);
      if (matchedStage) {
        score += weights.stage;
        console.log(`✅ Stage matched! +${weights.stage}`);
      }
      totalWeight += weights.stage;
    }

    // Funding range matching
    if (
      thesis.checkSizeMin !== undefined &&
      thesis.checkSizeMax !== undefined &&
      startup.fundingRequirement
    ) {
      const startupMin = startup.fundingRequirement.min || 0;
      const startupMax = startup.fundingRequirement.max || Infinity;
      const thesisMin = thesis.checkSizeMin;
      const thesisMax = thesis.checkSizeMax;

      // Check if funding ranges overlap
      const fundingOverlap = startupMin <= thesisMax && startupMax >= thesisMin;
      console.log(`💰 Funding matching: Startup ${startupMin}-${startupMax} vs Thesis ${thesisMin}-${thesisMax} -> ${fundingOverlap}`);
      
      if (fundingOverlap) {
        score += weights.funding;
        console.log(`✅ Funding matched! +${weights.funding}`);
      }
      totalWeight += weights.funding;
    }

    // Geography matching
    if (
      thesis.geographies &&
      thesis.geographies.length > 0 &&
      startup.location
    ) {
      const startupLocation = startup.location.toLowerCase();
      const matchedGeo = thesis.geographies.some(geo =>
        startupLocation.includes(geo.toLowerCase())
      );
      console.log(`🌍 Geography matching: ${startupLocation} vs ${thesis.geographies} -> ${matchedGeo}`);
      if (matchedGeo) {
        score += weights.geography;
        console.log(`✅ Geography matched! +${weights.geography}`);
      }
      totalWeight += weights.geography;
    }

    // Keyword matching
    if (
      thesis.keywords &&
      thesis.keywords.length > 0 &&
      startup.description
    ) {
      const description = startup.description.toLowerCase();
      const matchedKeywords = thesis.keywords.filter(keyword =>
        description.includes(keyword.toLowerCase())
      );
      const keywordScore = (matchedKeywords.length / thesis.keywords.length) * weights.keywords;
      console.log(`🔤 Keyword matching: ${matchedKeywords.length}/${thesis.keywords.length} matched -> +${keywordScore.toFixed(1)}`);
      
      if (matchedKeywords.length > 0) {
        score += keywordScore;
        console.log(`✅ Keywords matched! +${keywordScore.toFixed(1)}`);
      }
      totalWeight += weights.keywords;
    }

    // Excluded keywords penalty
    let excludedPenalty = false;
    if (
      thesis.excludedKeywords &&
      thesis.excludedKeywords.length > 0 &&
      startup.description
    ) {
      const description = startup.description.toLowerCase();
      const excludedMatches = thesis.excludedKeywords.filter(keyword =>
        description.includes(keyword.toLowerCase())
      );
      if (excludedMatches.length > 0) {
        console.log(`🚫 Excluded keywords found: ${excludedMatches} -> applying 30% penalty`);
        score *= 0.7; // 30% penalty for excluded keywords
        excludedPenalty = true;
      }
    }

    // Calculate final score
    const finalScore = totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 50;
    console.log(`🎯 Final calculation: ${score}/${totalWeight} = ${finalScore}%${excludedPenalty ? ' (with penalty)' : ''}`);

    // Ensure score is between 0-100
    return Math.min(100, Math.max(0, finalScore));
  };

  const fetchStartups = async (thesis = investorThesis) => {
    try {
      console.log("🔄 Fetching startups...");
      setDebugInfo(prev => prev + "\nFetching startups...");
      
      const res = await fetch("/api/investor/startups", { cache: "no-store" });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch startups: ${res.status}`);
      }
      
      const data = await res.json();
      console.log(`✅ Startups fetched: ${data.length} startups`);
      setDebugInfo(prev => prev + `\nFound ${data.length} startups`);

      // Use the provided thesis or fall back to state
      const thesisToUse = thesis || investorThesis;
      
      // Calculate relevancy scores for each startup
      const startupsWithScores = data.map((startup) => ({
        ...startup,
        relevanceScore: calculateRelevancyScore(startup, thesisToUse),
      }));

      console.log("📊 Startups with scores:", startupsWithScores.map(s => ({
        name: s.name,
        score: s.relevanceScore
      })));
      
      setDebugInfo(prev => prev + `\nScores calculated: ${startupsWithScores.map(s => s.relevanceScore).join(', ')}`);
      setStartups(startupsWithScores);
    } catch (err) {
      console.error("❌ Error fetching startups:", err);
      setDebugInfo(prev => prev + `\nError: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (activeTab === "Deals") {
      fetchDeals();
    }
  }, [activeTab]);

  const fetchDeals = async () => {
    try {
      const res = await fetch("/api/deals");
      const data = await res.json();
      if (res.ok) {
        setDeals(data.data);
      } else {
        console.error("Failed to fetch deals:", data.error);
      }
    } catch (err) {
      console.error("Error fetching deals:", err);
    }
  };

  const sendEmail = async () => {
    try {
      setLoading(true);

      // 1️⃣ Send the actual email
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
        alert("Error sending email: " + data.message);
        setLoading(false);
        return;
      }

      await fetch(`/api/investor/startups/${selectedStartup?._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "contacted" }),
      });

      // 3️⃣ Update UI locally
      setStartups((prev) =>
        prev.map((s) =>
          s._id === selectedStartup?._id ? { ...s, status: "contacted" } : s
        )
      );

      // 4️⃣ Reset states
      setLoading(false);
      setIsEmailModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error sending email");
      setLoading(false);
    }
  };

  // Filter startups based on active tab
  const filteredStartups = startups.filter((s) => {
    if (activeTab === "Pitch Connect") return true;
    if (activeTab === "Deals") return false;
    if (activeTab === "Archived") return s.status === "rejected";
    return true;
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <InvestorSidebar />

      <div className="flex-1 overflow-auto">
        {/* Debug Info - Remove in production */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-yellow-500">🔧</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Debug Info:</strong> {debugInfo}
              </p>
              <button 
                onClick={() => {
                  console.log("Current investorThesis:", investorThesis);
                  console.log("Current startups:", startups);
                }}
                className="text-xs bg-yellow-500 text-white px-2 py-1 rounded mt-1"
              >
                Log to Console
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-white">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-bold">Deals</h1>
              <p className="text-sm text-gray-600">
                An overview of your deal flow activity.
              </p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Tabs */}
            <div className="flex space-x-8 text-gray-600 font-medium">
              {["Deals", "Pitch Connect"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`cursor-pointer pb-2 border-b-2 transition ${
                    activeTab === tab
                      ? "text-emerald-600 border-emerald-600"
                      : "border-transparent hover:text-emerald-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Filter Dropdown */}
            <ConnectionFilterDropdown
              onChange={(value) => {
                console.log("Selected connection type:", value);
              }}
            />
          </div>

          <div className="py-8">
            {activeTab === "Deals" ? (
              deals.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                  <table className="w-full border-collapse">
                    <thead className="bg-emerald-50/60 text-gray-600 text-sm">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold">
                          From
                        </th>
                        <th className="px-6 py-3 text-left font-semibold">
                          Summary
                        </th>
                        <th className="px-6 py-3 text-left font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {deals.map((deal) => (
                        <tr
                          key={deal.emailId}
                          className="transition hover:bg-emerald-50/40"
                        >
                          <td className="text-sm px-6 py-4">{deal.from}</td>
                          <td className="text-sm px-6 py-4 font-medium">
                            {deal.summary}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="default"
                              className="w-25 mr-2 text-xs bg-white hover:bg-emerald-600 text-dark hover:text-white border border-[#ccc] font-medium"
                              onClick={() => {
                                setEmailContent({
                                  to: deal.fromEmail,
                                  subject: `Regarding Investment Opportunity`,
                                  body: `Hi ${deal?.from} Founder,\n\nI came across your startup and I'm interested in discussing potential investment opportunities.\n\nBest regards,\n[Your Name]`,
                                });
                                setIsEmailModalOpen(true);
                                setSelectedStartup(deal);
                              }}
                            >
                              Mail Founder
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center text-gray-500 font-medium">
                  No deals found.
                </div>
              )
            ) : activeTab === "Pitch Connect" && filteredStartups.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="w-full border-collapse">
                  <thead className="bg-emerald-50/60 text-gray-600 text-sm">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Connection Type
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Relevancy Score
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredStartups.map((startup) => {
                      console.log("Rendering startup:", startup.name, "Score:", startup.relevanceScore);
                      
                      return (
                        <tr
                          key={startup._id}
                          className="transition hover:bg-emerald-50/40"
                        >
                          <td className="text-sm px-6 py-4 font-medium">
                            <p>{startup.name}</p>
                            <Badge
                              variant="secondary"
                              className="mt-1 bg-primary/10 text-primary border-primary/20 font-medium"
                            >
                              {startup.sector}
                            </Badge>
                          </td>
                          <td className="text-sm px-6 py-4">
                            {startup.stage || "—"}
                          </td>
                          <td className="text-sm px-6 py-4 font-medium">
                            Email
                          </td>
                          <td className="text-sm px-6 py-4 text-sm">
                            <div className="flex items-center gap-3">
                              <Progress
                                value={startup?.relevanceScore || 50}
                                className="h-2 w-24"
                              />
                              <span className="text-sm font-medium">
                                {startup?.relevanceScore || 50}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {startup.status === "submitted" && (
                              <Badge className="bg-blue-100 text-blue-700">
                                Submitted
                              </Badge>
                            )}
                            {startup.status === "contacted" && (
                              <Badge className="bg-emerald-100 text-emerald-700">
                                Contacted
                              </Badge>
                            )}
                            {startup.status === "under_review" && (
                              <Badge className="bg-yellow-100 text-yellow-700">
                                Under Review
                              </Badge>
                            )}
                            {startup.status === "rejected" && (
                              <Badge className="bg-red-100 text-red-700">
                                Rejected
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="default"
                              className="w-25 mr-2 text-xs bg-white hover:bg-emerald-600 text-dark hover:text-white border border-[#ccc] font-medium"
                              onClick={() => {
                                setEmailContent({
                                  to: startup.founderId,
                                  subject: `Regarding Investment Opportunity in ${startup.name}`,
                                  body: `Hi ${startup.name} Founder,\n\nI came across your startup and I'm interested in discussing potential investment opportunities.\n\nBest regards,\n[Your Name]`,
                                });
                                setIsEmailModalOpen(true);
                                setSelectedStartup(startup);
                              }}
                              disabled={startup.status === "contacted"}
                            >
                              {startup.status === "contacted"
                                ? "Mail Sent"
                                : "Mail Founder"}
                            </Button>

                            <Button
                              variant="default"
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
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
                No startups found for {activeTab}.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Startup Details Modal */}
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
                  <p>
                    <span className="font-semibold">Team Size:</span>{" "}
                    {selectedStartup.teamSize || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Funding Requirement:</span>{" "}
                    ₹{selectedStartup.fundingRequirement?.min?.toLocaleString()}{" "}
                    – ₹
                    {selectedStartup.fundingRequirement?.max?.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-semibold">Founder Email:</span>{" "}
                    {selectedStartup.founderId}
                  </p>
                  <p>
                    <span className="font-semibold">Relevance Score:</span>{" "}
                    {selectedStartup.relevanceScore}%
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    <Badge className="ml-1 bg-blue-100 text-blue-700 capitalize">
                      {selectedStartup.status}
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

      {/* Email Modal */}
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
    </div>
  );
}
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

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    try {
      const res = await fetch("/api/investor/startups", { cache: "no-store" });
      const data = await res.json();
      setStartups(data);
    } catch (err) {
      console.error("Error fetching startups:", err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      //   year: "numeric",
    });
  };

  const sendEmail = async () => {
    // console.log(selectedStartup);
    // return

    try {
      setLoading(true);

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...emailContent,
          startupId: selectedStartup?._id, // 👈 include startup id
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Update local state so UI shows "Contacted" immediately
        setStartups((prev) =>
          prev.map((s) =>
            s._id === selectedStartup?._id ? { ...s, status: "contacted" } : s
          )
        );

        setLoading(false);
        setIsEmailModalOpen(false);
        console.log(
          "✅ Email sent & status updated for:",
          selectedStartup?.name
        );
      } else {
        alert("Error sending email: " + data.message);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error sending email");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <InvestorSidebar />
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-white">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-bold">Deals</h1>
              <p className="text-sm text-gray-600">
                An overview of your deal flow activity.
              </p>
            </div>
            {/* <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button> */}
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Tabs */}
            <div className="flex space-x-8 text-gray-600 font-medium">
              {["Deals", "Pitch Connect", "Archived"].map((tab, i) => (
                <button
                  key={i}
                  className={`pb-2 border-b-2 transition ${
                    tab === "Pitch Connect"
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
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
              <table className="w-full border-collapse">
                <thead className="bg-emerald-50/60 text-gray-600 text-sm">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left font-semibold">Stage</th>
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
                  {startups.map((startup) => (
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
                      <td className="text-sm px-6 py-4 font-medium">Email</td>
                      {/* <td className="text-sm px-6 py-4 text-sm">
                        ₹{startup.fundingRequirement?.min?.toLocaleString()} – ₹
                        {startup.fundingRequirement?.max?.toLocaleString()}
                      </td> */}
                      <td className="text-sm px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <Progress
                            value={startup?.relevanceScore || 80}
                            className="h-2 w-24"
                          />
                          <span className="text-sm font-medium">
                            {startup?.relevanceScore || 80}%
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
                        {/* <Button
                          variant="default"
                          className="mr-2 text-xs bg-white hover:bg-emerald-600 text-dark hover:text-white border border-[#ccc] font-medium"
                          onClick={() => {
                            setSelectedStartup(startup);
                            setIsModalOpen(true);
                          }}
                        >
                          Mail Founder
                        </Button> */}
                        <Button
                          variant="default"
                          className="mr-2 text-xs bg-white hover:bg-emerald-600 text-dark hover:text-white border border-[#ccc] font-medium"
                          onClick={() => {
                            setEmailContent({
                              to: startup.founderId,
                              subject: `Regarding Investment Opportunity in ${startup.name}`,
                              body: `Hi ${startup.name} Founder,\n\nI came across your startup and I'm interested in discussing potential investment opportunities.\n\nBest regards,\n[Your Name]`,
                            });
                            setIsEmailModalOpen(true),
                              setSelectedStartup(startup);
                          }}
                          disabled={startup.status === "contacted"}
                        >
                          {startup.status === "contacted" ? "Mail Sended" : "Mail Founder"}
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
                        {/* <span className="font-medium d-block text-xs">
                          {formatDate(startup.createdAt)}
                        </span> */}
                      </td>
                    </tr>
                  ))}

                  {startups.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-16 text-center text-gray-500 font-medium"
                      >
                        No startups found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ---- MODAL ---- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto p-8 bg-white rounded shadow-2xl">
          {selectedStartup && (
            <>
              {/* Header */}
              <DialogHeader className="border-b pb-4 gap-0">
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {selectedStartup.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  {selectedStartup.sector} • {selectedStartup.stage}
                </DialogDescription>
              </DialogHeader>

              {/* Main Content */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mt-6 text-gray-700">
                {/* Left Column */}
                <div className="space-y-4">
                  <p className="mb-1">
                    <span className="font-semibold">Location:</span>{" "}
                    {selectedStartup.location || "—"}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Team Size:</span>{" "}
                    {selectedStartup.teamSize || "—"}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Funding Requirement:</span>{" "}
                    ₹{selectedStartup.fundingRequirement?.min?.toLocaleString()}{" "}
                    – ₹
                    {selectedStartup.fundingRequirement?.max?.toLocaleString()}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Founder Email:</span>{" "}
                    {selectedStartup.founderId}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Relevance Score:</span>{" "}
                    {selectedStartup.relevanceScore || "—"}%
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Status:</span>{" "}
                    <Badge className="ml-1 bg-blue-100 text-blue-700 capitalize">
                      {selectedStartup.status}
                    </Badge>
                  </p>
                </div>

                {/* Right Column */}
                <div>
                  <p className="font-semibold mb-0 text-lg">Description:</p>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {selectedStartup.description}
                  </p>
                </div>
              </div>

              {/* Created/Updated */}
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

              {/* Sticky Footer */}
              <div className="sticky -bottom-8 left-0 right-0 bg-white border-t mt-8 py-4 flex justify-start gap-4 bg-white">
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

                {/* {selectedStartup.website && (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() =>
                      window.open(selectedStartup.website, "_blank")
                    }
                  >
                    🌐 Visit Website
                  </Button>
                )} */}
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
    </div>
  );
}

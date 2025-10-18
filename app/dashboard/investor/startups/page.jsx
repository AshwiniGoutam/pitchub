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

export default function Page() {
  const [startups, setStartups] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <div className="p-8">
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
                        {startup.status === "approved" && (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            Approved
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
                          className="mr-2 text-xs bg-white hover:bg-emerald-700 text-dark border border-[#ccc] font-medium"
                          onClick={() => {
                            setSelectedStartup(startup);
                            setIsModalOpen(true);
                          }}
                        >
                          Mail Founder
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
    </div>
  );
}

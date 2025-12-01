"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvestorSidebar } from "@/components/investor-sidebar";
import { X, Plus, Save, RefreshCw } from "lucide-react";
import type { InvestorThesis } from "@/lib/matching-engine";
import { useUser } from "@/context/UserContext";
import { countriesData, getAllCountries } from "@/lib/countries"; // optional: import list, fallback included

// Fallback country list if you don't have /lib/countries
const fallbackCountries = [
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Switzerland",
  "Sweden",
  "Norway",
  "Japan",
  "China",
  "Singapore",
  "Brazil",
  "South Africa",
  "United Arab Emirates",
  "Mexico",
];

export default function InvestorSettingsPage() {
  const [thesis, setThesis] = useState<InvestorThesis>({
    sectors: [],
    stages: [],
    checkSizeMin: 0,
    checkSizeMax: 0,
    geographies: [],
    keywords: [],
    excludedKeywords: [],
  });

  const [newKeyword, setNewKeyword] = useState("");
  const [newExcludedKeyword, setNewExcludedKeyword] = useState("");
  const [newGeography, setNewGeography] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useUser();

  // Country dropdown state
  const [countries] = useState(() => {
    try {
      // try importing function (if exists)
      // @ts-ignore
      if (typeof getAllCountries === "function") return getAllCountries();
    } catch (e) { }
    return countriesData;
  });
  const [countryQuery, setCountryQuery] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Normalize & fetch thesis
  useEffect(() => {
    if (user?.id) fetchInvestorThesis();
  }, [user]);

  async function fetchInvestorThesis() {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/investor/thesis", {
        headers: { "x-user-id": user.id },
      });
      if (res.ok) {
        const data = await res.json();
        // normalize arrays (be defensive)
        setThesis({
          ...data,
          sectors: Array.isArray(data.sectors) ? data.sectors : [],
          stages: Array.isArray(data.stages) ? data.stages : [],
          keywords: Array.isArray(data.keywords) ? data.keywords : [],
          excludedKeywords: Array.isArray(data.excludedKeywords)
            ? data.excludedKeywords
            : [],
          geographies: Array.isArray(data.geographies) ? data.geographies : [],
          checkSizeMin: data.checkSizeMin ?? 0,
          checkSizeMax: data.checkSizeMax ?? 0,
        });
      }
    } catch (err) {
      console.error("Fetch thesis error", err);
    } finally {
      setIsLoading(false);
    }
  }

  // Safe add / remove helpers
  const addItem = (key: keyof InvestorThesis, value: string) => {
    if (!value) return;
    setThesis((prev) => {
      const current = Array.isArray(prev[key]) ? (prev[key] as string[]) : [];
      if (current.includes(value)) return prev;
      return { ...prev, [key]: [...current, value] } as InvestorThesis;
    });
  };

  const removeItem = (key: keyof InvestorThesis, value: string) => {
    setThesis((prev) => {
      const current = Array.isArray(prev[key]) ? (prev[key] as string[]) : [];
      const updated = current.filter((v) => v !== value);
      return { ...prev, [key]: updated } as InvestorThesis;
    });
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/investor/thesis", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify(thesis),
      });
      if (res.ok) {
        setMessage("Investment thesis saved successfully!");
        await triggerReMatching();
      } else {
        setMessage("Error saving thesis. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error saving thesis. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const triggerReMatching = async () => {
    try {
      await fetch("/api/investor/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investorThesis: thesis }),
      });
    } catch (err) {
      console.error("re-match error", err);
    }
  };

  // Dropdown: close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // filtered countries
  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(countryQuery.trim().toLowerCase())
  );


  if (isLoading) {
    return (
      <div className="flex h-screen">
        <InvestorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <InvestorSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Investment Thesis
            </h1>
            <p className="text-muted-foreground">
              Configure your investment preferences to improve deal flow matching
              and relevance scoring
            </p>
          </div>

          {message && (
            <Alert
              className={
                message.includes("Error")
                  ? "border-red-200 bg-red-50"
                  : "border-green-200 bg-green-50"
              }
            >
              <AlertDescription
                className={
                  message.includes("Error") ? "text-red-800" : "text-green-800"
                }
              >
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="w-full space-y-6 mx-auto">
            {/* Sectors */}
            <Card>
              <CardHeader>
                <CardTitle>Preferred Sectors</CardTitle>
                <CardDescription>
                  Select the industries and sectors you typically invest in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {thesis.sectors.map((s) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {s}
                      <span
                        onClick={() => removeItem("sectors", s)}>
                        <X
                          className="h-3 w-3 cursor-pointer"
                        />
                      </span>
                    </Badge>
                  ))}
                </div>
                <Select
                  onValueChange={(value) => addItem("sectors", value)}
                  defaultValue=""
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Add a sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Fintech",
                      "HealthTech",
                      "EdTech",
                      "AI/ML",
                      "SaaS",
                      "E-commerce",
                      "CleanTech",
                      "AgriTech",
                      "Cybersecurity",
                      "Blockchain",
                    ].map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Funding Stages */}
            <Card>
              <CardHeader>
                <CardTitle>Funding Stages</CardTitle>
                <CardDescription>
                  Select the funding stages you typically invest in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {thesis.stages.map((s) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {s}
                      {/* <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeItem("stages", s)}
                      /> */}
                      <span
                        onClick={() => removeItem("stages", s)}>
                        <X
                          className="h-3 w-3 cursor-pointer"
                        />
                      </span>
                    </Badge>
                  ))}
                </div>
                <Select
                  onValueChange={(value) => addItem("stages", value)}
                  defaultValue=""
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Add a funding stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"].map(
                      (stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Check Size */}
            <Card>
              <CardHeader>
                <CardTitle>Check Size Range</CardTitle>
                <CardDescription>
                  Define your typical investment amount range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkSizeMin">Minimum Check Size ($)</Label>
                    <Input
                      id="checkSizeMin"
                      type="number"
                      placeholder="50000"
                      value={thesis.checkSizeMin || ""}
                      onChange={(e) =>
                        setThesis((prev) => ({
                          ...prev,
                          checkSizeMin: Number.parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkSizeMax">Maximum Check Size ($)</Label>
                    <Input
                      id="checkSizeMax"
                      type="number"
                      placeholder="500000"
                      value={thesis.checkSizeMax || ""}
                      onChange={(e) =>
                        setThesis((prev) => ({
                          ...prev,
                          checkSizeMax: Number.parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Geographies */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Preferences</CardTitle>
                <CardDescription>
                  Specify regions or countries you prefer to invest in
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* selected badges */}
                <div className="flex flex-wrap gap-2">
                  {thesis.geographies.map((g) => (
                    <Badge
                      key={g}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {g}
                      <span onClick={() => removeItem("geographies", g)}>
                        <X className="h-3 w-3 cursor-pointer" />
                      </span>
                    </Badge>
                  ))}
                </div>

                {/* custom dropdown */}
                <div ref={dropdownRef} className="relative">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen((v) => !v);
                        setCountryQuery("");
                      }}
                      className="w-full text-left px-3 py-1 border rounded-md bg-white"
                    >
                      {countryQuery ? (
                        <span className="text-sm text-foreground">{countryQuery}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {thesis.geographies.length > 0
                            ? "Add another country..."
                            : "Select a country"}
                        </span>
                      )}
                    </button>

                    <Button
                      size="sm"
                      onClick={() => {
                        // add manually typed geography if not empty
                        if (newGeography && newGeography.trim()) {
                          addItem("geographies", newGeography.trim());
                          setNewGeography("");
                        } else {
                          // open dropdown
                          setDropdownOpen((v) => !v);
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-40 mt-2 w-full max-h-60 overflow-auto rounded-md border bg-white shadow-lg">
                      <div className="p-2">
                        <Input
                          value={countryQuery}
                          onChange={(e) => setCountryQuery(e.target.value)}
                          placeholder="Search country..."
                          className="mb-2"
                        />

                        <div>
                          {filteredCountries.length === 0 ? (
                            <div className="px-2 py-3 text-sm text-muted-foreground">
                              No results
                            </div>
                          ) : (
                            filteredCountries.map((country) => (
                              <div
                                key={country}
                                className={`flex w-full cursor-pointer items-center justify-between px-2 py-2 hover:bg-slate-50 ${thesis.geographies.includes(country)
                                  ? "opacity-60"
                                  : ""
                                  }`}
                                onClick={() => {
                                  addItem("geographies", country);
                                  setDropdownOpen(false);
                                }}
                              >
                                <span>{country}</span>
                                {thesis.geographies.includes(country) && (
                                  <span className="text-xs text-muted-foreground">
                                    Selected
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>


            {/* Keywords */}
            <Card>
              <CardHeader>
                <CardTitle>Positive Keywords</CardTitle>
                <CardDescription>
                  Keywords that increase relevance when found in startup descriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {thesis.keywords.map((k) => (
                    <Badge
                      key={k}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {k}
                      {/* <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeItem("keywords", k)}
                      /> */}
                      <span
                        onClick={() => removeItem("keywords", k)}>
                        <X
                          className="h-3 w-3 cursor-pointer"
                        />
                      </span>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., B2B, SaaS, AI, machine learning"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addItem("keywords", newKeyword) && setNewKeyword("")}
                  />
                  <Button
                    onClick={() => {
                      addItem("keywords", newKeyword);
                      setNewKeyword("");
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Excluded Keywords */}
            <Card>
              <CardHeader>
                <CardTitle>Excluded Keywords</CardTitle>
                <CardDescription>
                  Keywords that decrease relevance when found in startup descriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {thesis.excludedKeywords.map((k) => (
                    <Badge
                      key={k}
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      {k}
                      {/* <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeItem("excludedKeywords", k)}
                      /> */}
                      <span
                        onClick={() => removeItem("excludedKeywords", s)}>
                        <X
                          className="h-3 w-3 cursor-pointer"
                        />
                      </span>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., B2C, consumer, retail"
                    value={newExcludedKeyword}
                    onChange={(e) => setNewExcludedKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addItem("excludedKeywords", newExcludedKeyword) && setNewExcludedKeyword("")}
                  />
                  <Button
                    onClick={() => {
                      addItem("excludedKeywords", newExcludedKeyword);
                      setNewExcludedKeyword("");
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save & Re-match */}
            <div className="flex gap-4">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Investment Thesis"}
              </Button>
              <Button
                variant="outline"
                onClick={triggerReMatching}
                disabled={isSaving}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-match Existing Deals
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

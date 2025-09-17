"use client";

import { useState, useEffect } from "react";
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
  console.log('user',user);
  

useEffect(() => {
  if (user?._id) {
    fetchInvestorThesis()
  }
}, [user])


  const fetchInvestorThesis = async () => {
    if (!user?._id) return;
    try {
      const response = await fetch("/api/investor/thesis", {
        headers: {
          "x-user-id": user._id, // ✅ pass user ID
        },
      });
      if (response.ok) {
        const data = await response.json();
        setThesis(data);
      }
    } catch (error) {
      console.error("Error fetching thesis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?._id) return;
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/investor/thesis", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user._id, // ✅ pass user ID
        },
        body: JSON.stringify(thesis),
      });

      if (response.ok) {
        setMessage("Investment thesis saved successfully!");
        await triggerReMatching();
      } else {
        setMessage("Error saving thesis. Please try again.");
      }
    } catch (error) {
      setMessage("Error saving thesis. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const triggerReMatching = async () => {
    try {
      await fetch("/api/investor/matching", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ investorThesis: thesis }),
      });
    } catch (error) {
      console.error("Error triggering re-matching:", error);
    }
  };

  const addSector = (sector: string) => {
    if (sector && !thesis.sectors.includes(sector)) {
      setThesis((prev) => ({ ...prev, sectors: [...prev.sectors, sector] }));
    }
  };

  const removeSector = (sector: string) => {
    setThesis((prev) => ({
      ...prev,
      sectors: prev.sectors.filter((s) => s !== sector),
    }));
  };

  const addStage = (stage: string) => {
    if (stage && !thesis.stages.includes(stage)) {
      setThesis((prev) => ({ ...prev, stages: [...prev.stages, stage] }));
    }
  };

  const removeStage = (stage: string) => {
    setThesis((prev) => ({
      ...prev,
      stages: prev.stages.filter((s) => s !== stage),
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !thesis.keywords.includes(newKeyword.trim())) {
      setThesis((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()],
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setThesis((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const addExcludedKeyword = () => {
    if (
      newExcludedKeyword.trim() &&
      !thesis.excludedKeywords.includes(newExcludedKeyword.trim())
    ) {
      setThesis((prev) => ({
        ...prev,
        excludedKeywords: [...prev.excludedKeywords, newExcludedKeyword.trim()],
      }));
      setNewExcludedKeyword("");
    }
  };

  const removeExcludedKeyword = (keyword: string) => {
    setThesis((prev) => ({
      ...prev,
      excludedKeywords: prev.excludedKeywords.filter((k) => k !== keyword),
    }));
  };

  const addGeography = () => {
    if (
      newGeography.trim() &&
      !thesis.geographies.includes(newGeography.trim())
    ) {
      setThesis((prev) => ({
        ...prev,
        geographies: [...prev.geographies, newGeography.trim()],
      }));
      setNewGeography("");
    }
  };

  const removeGeography = (geography: string) => {
    setThesis((prev) => ({
      ...prev,
      geographies: prev.geographies.filter((g) => g !== geography),
    }));
  };

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
              Configure your investment preferences to improve deal flow
              matching and relevance scoring
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
                  {thesis.sectors.map((sector) => (
                    <Badge
                      key={sector}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {sector}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSector(sector)}
                      />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addSector}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Add a sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fintech">Fintech</SelectItem>
                    <SelectItem value="HealthTech">HealthTech</SelectItem>
                    <SelectItem value="EdTech">EdTech</SelectItem>
                    <SelectItem value="AI/ML">AI/ML</SelectItem>
                    <SelectItem value="SaaS">SaaS</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="CleanTech">CleanTech</SelectItem>
                    <SelectItem value="AgriTech">AgriTech</SelectItem>
                    <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                    <SelectItem value="Blockchain">Blockchain</SelectItem>
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
                  {thesis.stages.map((stage) => (
                    <Badge
                      key={stage}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {stage}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeStage(stage)}
                      />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addStage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Add a funding stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                    <SelectItem value="Seed">Seed</SelectItem>
                    <SelectItem value="Series A">Series A</SelectItem>
                    <SelectItem value="Series B">Series B</SelectItem>
                    <SelectItem value="Series C+">Series C+</SelectItem>
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
                <div className="flex flex-wrap gap-2">
                  {thesis.geographies.map((geography) => (
                    <Badge
                      key={geography}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {geography}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeGeography(geography)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., United States, Europe, Asia"
                    value={newGeography}
                    onChange={(e) => setNewGeography(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addGeography()}
                  />
                  <Button onClick={addGeography} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Keywords */}
            <Card>
              <CardHeader>
                <CardTitle>Positive Keywords</CardTitle>
                <CardDescription>
                  Keywords that increase relevance when found in startup
                  descriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {thesis.keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {keyword}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., B2B, SaaS, AI, machine learning"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                  />
                  <Button onClick={addKeyword} size="sm">
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
                  Keywords that decrease relevance when found in startup
                  descriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {thesis.excludedKeywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      {keyword}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeExcludedKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., B2C, consumer, retail"
                    value={newExcludedKeyword}
                    onChange={(e) => setNewExcludedKeyword(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && addExcludedKeyword()
                    }
                  />
                  <Button onClick={addExcludedKeyword} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
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

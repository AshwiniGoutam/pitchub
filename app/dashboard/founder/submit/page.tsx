"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FounderSidebar } from "@/components/founder-sidebar";
import { Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SubmitPitchPage() {
  const [formData, setFormData] = useState({
    name: "",
    sector: "",
    stage: "",
    location: "",
    fundingMin: "",
    fundingMax: "",
    description: "",
    website: "",
    teamSize: "",
  });
  const [pitchDeck, setPitchDeck] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = [
        "application/pdf",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF or PowerPoint file");
        return;
      }

      if (file.size > maxSize) {
        setError("File size must be less than 10MB");
        return;
      }

      setPitchDeck(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create FormData for file upload
      const submitData = new FormData();

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      // Add pitch deck if uploaded
      if (pitchDeck) {
        submitData.append("pitchDeck", pitchDeck);
      }

      const response = await fetch("/api/founder/submit", {
        method: "POST",
        body: submitData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          "Pitch submitted successfully! You'll receive feedback on relevance matching."
        );
        setTimeout(() => {
          router.push("/dashboard/founder");
        }, 2000);
      } else {
        setError(data.message || "Submission failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* <FounderSidebar /> */}

      <div className="flex-1 overflow-auto">
        <header className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="font-semibold tracking-tight">
              <img src="/images/logo.png" alt="logo" width="200px" />
            </a>
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                About
              </Link>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Why Pitchub
              </Link>
            </nav>
            <Link
              href="/dashboard/founder/submit"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
            >
              Join the Waitlist
            </Link>
          </div>
        </header>
        <div className="p-6 mt-4">
          {/* Header */}
          <div className="mb-8 mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
              Submit Your Pitch
            </h1>
            <p className="text-muted-foreground text-center">
              Provide details about your startup to connect with relevant
              investors
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Startup Information</CardTitle>
                <CardDescription>
                  Fill out the form below to submit your pitch to our network of
                  investors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Startup Name *</Label>
                        <Input
                          id="name"
                          placeholder="Enter your startup name"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          placeholder="https://yourwebsite.com"
                          value={formData.website}
                          onChange={(e) =>
                            handleInputChange("website", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your startup, what problem you solve, and your solution..."
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows={4}
                        required
                      />
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Business Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sector">Sector *</Label>
                        <Select
                          onValueChange={(value) =>
                            handleInputChange("sector", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your sector" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fintech">Fintech</SelectItem>
                            <SelectItem value="HealthTech">
                              HealthTech
                            </SelectItem>
                            <SelectItem value="EdTech">EdTech</SelectItem>
                            <SelectItem value="AI/ML">AI/ML</SelectItem>
                            <SelectItem value="E-commerce">
                              E-commerce
                            </SelectItem>
                            <SelectItem value="SaaS">SaaS</SelectItem>
                            <SelectItem value="CleanTech">CleanTech</SelectItem>
                            <SelectItem value="AgriTech">AgriTech</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stage">Funding Stage *</Label>
                        <Select
                          onValueChange={(value) =>
                            handleInputChange("stage", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                            <SelectItem value="Seed">Seed</SelectItem>
                            <SelectItem value="Series A">Series A</SelectItem>
                            <SelectItem value="Series B">Series B</SelectItem>
                            <SelectItem value="Series C+">Series C+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          placeholder="City, Country"
                          value={formData.location}
                          onChange={(e) =>
                            handleInputChange("location", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teamSize">Team Size</Label>
                        <Input
                          id="teamSize"
                          placeholder="e.g., 5"
                          value={formData.teamSize}
                          onChange={(e) =>
                            handleInputChange("teamSize", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Funding Requirements */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Funding Requirements
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fundingMin">
                          Minimum Funding ($) *
                        </Label>
                        <Input
                          id="fundingMin"
                          type="number"
                          placeholder="100000"
                          value={formData.fundingMin}
                          onChange={(e) =>
                            handleInputChange("fundingMin", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fundingMax">
                          Maximum Funding ($) *
                        </Label>
                        <Input
                          id="fundingMax"
                          type="number"
                          placeholder="500000"
                          value={formData.fundingMax}
                          onChange={(e) =>
                            handleInputChange("fundingMax", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pitch Deck Upload */}
                  {/* <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Pitch Deck</h3>

                    <div className="space-y-2">
                      <Label htmlFor="pitchDeck">
                        Upload Pitch Deck (PDF or PowerPoint)
                      </Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {pitchDeck
                              ? pitchDeck.name
                              : "Click to upload or drag and drop"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF or PowerPoint up to 10MB
                          </p>
                          <Input
                            id="pitchDeck"
                            type="file"
                            accept=".pdf,.ppt,.pptx"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("pitchDeck")?.click()
                            }
                          >
                            Choose File
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? "Submitting..." : "Submit Pitch"}
                    </Button>
                    <Link href="/">
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

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
import { Upload, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function SubmitPitchPage() {
  const { data: session } = useSession();
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

      <div className="flex-1 overflow-auto position-relative z-1">
        <header className="border-b border-gray-100 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/logo.png" alt="Pitchub" width={180} height={40} className="h-10 w-auto" />
            </div>
            {/* <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium px-4 py-2">Join Waitlist</Button> */}
            {session?.user && (
              <div className="flex flex-col items-center gap-1">
                {/* <img
                  src={session.user.image ?? undefined}
                  alt="User Image"
                  className="w-10 h-10 rounded-full"
                /> */}
                <img
                  src={session.user.image ?? undefined}
                  alt="User Image"
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/images/dummy-user.png';
                  }}
                />

                <p className="text-sm">{session.user.name}</p>
              </div>
            )}
          </div>
        </header>
        <div className="p-6 mt-4 position-relative">
          <div className="absolute inset-0 opacity-40 -z-1">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="40" stroke="#e0e0e0" stroke-width="1" />
                  <line x1="0" y1="0" x2="40" y2="0" stroke="#e0e0e0" stroke-width="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridPattern)" />
            </svg>

          </div>
          {/* Header */}
          <div className="">
            <div className="mb-8 mx-auto">
              <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
                Submit Your Pitch
              </h1>
              <p className="text-muted-foreground text-center">
                Provide details about your startup to connect with relevant
                investors
              </p>
            </div>

            <div className="max-w-3xl mx-auto z-9">
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
                      <Alert variant="destructive" className="success-alert-box">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="border-green-200 bg-green-50 success-alert-box">
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
        <footer className="bg-foreground text-background py-12 mt-10">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl md:text-4xl text-card-foreground mb-4 text-balance text-white">
                    Pitchub
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-background/80">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:hello@pitchub.com" className="hover:text-background transition-colors">
                    hello@pitchub.com
                  </a>
                </div>
              </div>

              <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-background/60">
                <p>© 2025 Pitchub. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

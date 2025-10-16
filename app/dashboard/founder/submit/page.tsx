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
import { Mail, Upload } from "lucide-react";
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
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Startup Name is required";
      if (!formData.description.trim())
        newErrors.description = "Description is required";
    }

    if (step === 2) {
      if (!formData.sector) newErrors.sector = "Sector is required";
      if (!formData.stage) newErrors.stage = "Funding Stage is required";
      if (!formData.location.trim())
        newErrors.location = "Location is required";
    }

    if (step === 3) {
      if (!formData.fundingMin)
        newErrors.fundingMin = "Minimum funding is required";
      if (!formData.fundingMax)
        newErrors.fundingMax = "Maximum funding is required";
      if (
        formData.fundingMin &&
        formData.fundingMax &&
        Number(formData.fundingMin) >= Number(formData.fundingMax)
      )
        newErrors.fundingMin = "Minimum must be less than maximum";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setIsLoading(true);
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      if (pitchDeck) submitData.append("pitchDeck", pitchDeck);

      const response = await fetch("/api/founder/submit", {
        method: "POST",
        body: submitData,
      });
      const data = await response.json();

      if (response.ok) {
        setStep(1);
        setFormData({
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
        router.push("/dashboard/founder");
      } else {
        alert(data.message || "Submission failed");
      }
    } catch {
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 overflow-auto position-relative z-1">
        <header className="border-b border-gray-100 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Pitchub"
                width={180}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            {session?.user && (
              <div className="flex flex-col items-center gap-1">
                <img
                  src={session.user.image ?? undefined}
                  alt="User Image"
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/images/dummy-user.png";
                  }}
                />
                <p className="text-sm">{session.user.name}</p>
              </div>
            )}
          </div>
        </header>

        <div className="p-6 mt-4 position-relative">
          <div className="mb-8 mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
              Submit Your Pitch
            </h1>
            <p className="text-muted-foreground text-center">
              Provide details about your startup to connect with relevant
              investors
            </p>
          </div>

          {/* Step Indicator */}
          <div className="max-w-4xl mx-auto z-9">
            <div className="flex justify-between items-center mb-8">
              {["Basic Info", "Business", "Funding"].map((label, i) => {
                const stepNumber = i + 1;
                const isActive = step === stepNumber;
                const isCompleted = step > stepNumber;

                return (
                  <div
                    key={i}
                    className={`flex items-center ${i !== 2 && "flex-1"}`}
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        isActive
                          ? "bg-primary text-white"
                          : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {stepNumber}
                    </div>
                    <span
                      className={`ml-2 text-sm ${
                        isActive
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                    {i < 2 && <div className="flex-1 h-[2px] bg-border mx-4" />}
                  </div>
                );
              })}
            </div>
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
                  {/* STEP 1 */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Basic Information
                      </h3>
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
                          />
                          {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.name}
                            </p>
                          )}
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
                          placeholder="Describe your startup..."
                          value={formData.description}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          rows={4}
                        />
                        {errors.description && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Business Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sector">Sector *</Label>
                          <Select
                            value={formData.sector}
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
                              <SelectItem value="CleanTech">
                                CleanTech
                              </SelectItem>
                              <SelectItem value="AgriTech">AgriTech</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.sector && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.sector}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stage">Funding Stage *</Label>
                          <Select
                            value={formData.stage}
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
                              <SelectItem value="Series C+">
                                Series C+
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.stage && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.stage}
                            </p>
                          )}
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
                          />
                          {errors.location && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.location}
                            </p>
                          )}
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
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
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
                          />
                          {errors.fundingMin && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.fundingMin}
                            </p>
                          )}
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
                          />
                          {errors.fundingMax && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.fundingMax}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ✅ Pitch Deck Upload Section */}
                      <div className="space-y-2 mt-6">
                        <Label htmlFor="pitchDeck">
                          Pitch Deck (PDF, PPT, PPTX – max 10MB)
                        </Label>
                        <div
                          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 transition"
                          onClick={() =>
                            document.getElementById("pitchDeck")?.click()
                          }
                        >
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {pitchDeck
                              ? pitchDeck.name
                              : "Click to upload or drag and drop"}
                          </p>
                          <Input
                            id="pitchDeck"
                            type="file"
                            accept=".pdf,.ppt,.pptx"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setPitchDeck(file);
                            }}
                          />
                          {pitchDeck && (
                            <p className="text-xs text-green-600 mt-2">
                              ✅ {pitchDeck.name} selected
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4 - Upload Pitch Deck */}
                  {/* {step === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Upload Pitch Deck
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="pitchDeck">
                          Pitch Deck (PDF or PowerPoint, max 10MB) *
                        </Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {pitchDeck
                              ? pitchDeck.name
                              : "Click to upload or drag and drop"}
                          </p>
                          <Input
                            id="pitchDeck"
                            type="file"
                            accept=".pdf,.ppt,.pptx"
                            // onChange={handleFileChange}
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
                  )} */}

                  {/* Navigation */}
                  <div className="flex gap-4">
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                      >
                        Back
                      </Button>
                    )}

                    {step < 3 ? (
                      <Button
                        type="button"
                        onClick={() => {
                          if (validateStep(step)) setStep(step + 1);
                        }}
                        className="flex-1"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? "Submitting..." : "Submit Pitch"}
                      </Button>
                    )}

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
                  <a
                    href="mailto:hello@pitchub.com"
                    className="hover:text-background transition-colors"
                  >
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

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, Save, Edit, FileText, Users, DollarSign, TrendingUp } from "lucide-react"

export function StartupProfile() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Company Profile</h1>
          <p className="text-muted-foreground">Manage your startup information and pitch materials</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
          {isEditing && (
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="font-heading">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                defaultValue="TechFlow AI"
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                defaultValue="AI-powered workflow automation for enterprises"
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                defaultValue="TechFlow AI revolutionizes enterprise workflows through intelligent automation, helping companies reduce manual tasks by 80% while improving accuracy and efficiency."
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Select disabled={!isEditing}>
                  <SelectTrigger className={!isEditing ? "bg-muted" : ""}>
                    <SelectValue placeholder="AI/ML" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai-ml">AI/ML</SelectItem>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="healthtech">HealthTech</SelectItem>
                    <SelectItem value="cleantech">CleanTech</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select disabled={!isEditing}>
                  <SelectTrigger className={!isEditing ? "bg-muted" : ""}>
                    <SelectValue placeholder="Series A" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                    <SelectItem value="series-b">Series B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                defaultValue="San Francisco, CA"
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
          </CardContent>
        </Card>

        {/* Fundraising Details */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="font-heading">Fundraising Details</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="funding-goal">Funding Goal</Label>
              <Input
                id="funding-goal"
                defaultValue="$2,500,000"
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="use-of-funds">Use of Funds</Label>
              <Textarea
                id="use-of-funds"
                defaultValue="60% Product Development, 25% Sales & Marketing, 15% Operations"
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valuation">Pre-money Valuation</Label>
                <Input
                  id="valuation"
                  defaultValue="$12,000,000"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  defaultValue="3-4 months"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="font-heading">Key Metrics & Traction</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="revenue">Monthly Revenue</Label>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="revenue"
                  defaultValue="175,000"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customers">Active Customers</Label>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="customers"
                  defaultValue="45"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="growth">Monthly Growth</Label>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <Input id="growth" defaultValue="40%" disabled={!isEditing} className={!isEditing ? "bg-muted" : ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-size">Team Size</Label>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="team-size"
                  defaultValue="12"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pitch Materials */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="font-heading">Pitch Materials</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Current Documents</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Pitch Deck v3.2</p>
                      <p className="text-sm text-muted-foreground">Updated 2 days ago</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Financial Model</p>
                      <p className="text-sm text-muted-foreground">Updated 1 week ago</p>
                    </div>
                  </div>
                  <Badge variant="outline">Draft</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Executive Summary</p>
                      <p className="text-sm text-muted-foreground">Updated 3 days ago</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Upload New Documents</h4>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
                <Button variant="outline" size="sm">
                  Choose Files
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

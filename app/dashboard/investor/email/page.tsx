"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { InvestorSidebar } from "@/components/investor-sidebar"
import { Mail, Mail as Gmail, Unlock as Outlook, CheckCircle, AlertCircle, Send as Sync, Settings } from "lucide-react"

interface EmailIntegration {
  _id: string
  provider: "gmail" | "outlook"
  isActive: boolean
  lastSync: string
  emailsProcessed: number
}

export default function EmailSetupPage() {
  const [integrations, setIntegrations] = useState<EmailIntegration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const response = await fetch("/api/investor/email/integrations")
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data)
      }
    } catch (error) {
      console.error("Error fetching integrations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (provider: "gmail" | "outlook") => {
    try {
      // In a real implementation, this would redirect to OAuth flow
      const response = await fetch("/api/investor/email/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider }),
      })

      if (response.ok) {
        fetchIntegrations()
      }
    } catch (error) {
      console.error("Error connecting email:", error)
    }
  }

  const handleToggleActive = async (integrationId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/investor/email/integrations/${integrationId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        setIntegrations((prev) =>
          prev.map((integration) => (integration._id === integrationId ? { ...integration, isActive } : integration)),
        )
      }
    } catch (error) {
      console.error("Error toggling integration:", error)
    }
  }

  const handleSync = async () => {
    setSyncStatus("syncing")
    try {
      const response = await fetch("/api/investor/email/sync", {
        method: "POST",
      })

      if (response.ok) {
        setSyncStatus("success")
        fetchIntegrations()
        setTimeout(() => setSyncStatus("idle"), 3000)
      } else {
        setSyncStatus("error")
        setTimeout(() => setSyncStatus("idle"), 3000)
      }
    } catch (error) {
      setSyncStatus("error")
      setTimeout(() => setSyncStatus("idle"), 3000)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "gmail":
        return <Gmail className="h-6 w-6 text-red-500" />
      case "outlook":
        return <Outlook className="h-6 w-6 text-blue-500" />
      default:
        return <Mail className="h-6 w-6" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <InvestorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading email settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <InvestorSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Email Integration</h1>
            <p className="text-muted-foreground">
              Connect your email accounts to automatically capture and analyze startup pitches
            </p>
          </div>

          {/* Sync Status */}
          {syncStatus !== "idle" && (
            <div className="mb-6">
              {syncStatus === "syncing" && (
                <Alert>
                  <Sync className="h-4 w-4 animate-spin" />
                  <AlertDescription>Syncing emails and processing new pitches...</AlertDescription>
                </Alert>
              )}
              {syncStatus === "success" && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Email sync completed successfully!</AlertDescription>
                </Alert>
              )}
              {syncStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Error syncing emails. Please try again.</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="grid gap-6">
            {/* Connected Accounts */}
            <Card>
              <CardHeader>
                <CardTitle>Connected Email Accounts</CardTitle>
                <CardDescription>Manage your connected email providers and sync settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrations.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No email accounts connected</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect your email accounts to start receiving and analyzing startup pitches automatically.
                    </p>
                  </div>
                ) : (
                  integrations.map((integration) => (
                    <div
                      key={integration._id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {getProviderIcon(integration.provider)}
                        <div>
                          <h4 className="font-semibold capitalize">{integration.provider}</h4>
                          <p className="text-sm text-muted-foreground">
                            Last sync: {new Date(integration.lastSync).toLocaleDateString()} •{" "}
                            {integration.emailsProcessed} emails processed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={integration.isActive ? "default" : "secondary"}>
                          {integration.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={integration.isActive}
                            onCheckedChange={(checked) => handleToggleActive(integration._id, checked)}
                          />
                          <Label htmlFor="active">Active</Label>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Connect New Account */}
            <Card>
              <CardHeader>
                <CardTitle>Connect Email Provider</CardTitle>
                <CardDescription>Add a new email account to capture startup pitches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Gmail className="h-8 w-8 text-red-500" />
                        <div>
                          <h3 className="font-semibold">Gmail</h3>
                          <p className="text-sm text-muted-foreground">Connect your Gmail account</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleConnect("gmail")}
                        className="w-full"
                        disabled={integrations.some((i) => i.provider === "gmail")}
                      >
                        {integrations.some((i) => i.provider === "gmail") ? "Connected" : "Connect Gmail"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Outlook className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-semibold">Outlook</h3>
                          <p className="text-sm text-muted-foreground">Connect your Outlook account</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleConnect("outlook")}
                        className="w-full"
                        disabled={integrations.some((i) => i.provider === "outlook")}
                      >
                        {integrations.some((i) => i.provider === "outlook") ? "Connected" : "Connect Outlook"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Sync Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Email Sync</CardTitle>
                <CardDescription>Manually sync your emails or configure automatic sync settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold mb-1">Manual Sync</h4>
                    <p className="text-sm text-muted-foreground">
                      Fetch and process new emails from your connected accounts
                    </p>
                  </div>
                  <Button onClick={handleSync} disabled={syncStatus === "syncing" || integrations.length === 0}>
                    <Sync className={`h-4 w-4 mr-2 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
                    {syncStatus === "syncing" ? "Syncing..." : "Sync Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Processing Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Processing Settings</CardTitle>
                <CardDescription>Configure how emails are processed and categorized</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-categorize">Auto-categorize pitches</Label>
                    <p className="text-sm text-muted-foreground">Automatically categorize emails as startup pitches</p>
                  </div>
                  <Switch id="auto-categorize" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="extract-attachments">Extract attachments</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically extract and store pitch decks and documents
                    </p>
                  </div>
                  <Switch id="extract-attachments" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="relevance-scoring">Relevance scoring</Label>
                    <p className="text-sm text-muted-foreground">
                      Calculate relevance scores based on your investment thesis
                    </p>
                  </div>
                  <Switch id="relevance-scoring" defaultChecked />
                </div>

                <div className="pt-4">
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

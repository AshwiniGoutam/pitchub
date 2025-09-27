"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  role: "Founder" | "Investor"
}

export function WaitlistForm({ role }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    // Placeholder: In a future step, post to an API route or integrate Supabase.
    console.log("[v0] Waitlist submission", {
      role,
      name: fd.get("name"),
      email: fd.get("email"),
      company: fd.get("company"),
      website: fd.get("website"),
      message: fd.get("message"),
    })

    await new Promise((r) => setTimeout(r, 600)) // simulate
    setLoading(false)
    toast({
      title: "Submitted!",
      description: `Thanks for joining the ${role} waitlist. We'll be in touch soon.`,
    })
    e.currentTarget.reset()
  }

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="text-pretty">{role} Waitlist</CardTitle>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" required placeholder="Alex Founder" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="alex@startup.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">{role === "Founder" ? "Startup Name" : "Firm / Company"}</Label>
            <Input id="company" name="company" required placeholder={role === "Founder" ? "Acme AI" : "Acme Capital"} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input id="website" name="website" type="url" placeholder="https://example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              name="message"
              placeholder={`Share anything that helps us tailor Pitchub for ${role.toLowerCase()}s.`}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : `Join as ${role}`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

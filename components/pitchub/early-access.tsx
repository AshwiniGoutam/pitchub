import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function EarlyAccess() {
  return (
    <section id="early-access" className="border-t border-border bg-blue">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-pretty">Be the first to experience Pitchub.</h2>
          <p className="mt-3 text-muted-foreground">Sign up today and get early access when we launch.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Founder</CardTitle>
              <CardDescription>Submit your details to join the founder waitlist.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Present, manage, and track your fundraising with ease.
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/dashboard/founder/submit">Join as Founder</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Investor</CardTitle>
              <CardDescription>Submit your details to join the investor waitlist.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Gain insight into deal flow, portfolio performance, and funding status.
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/dashboard/founder/submit">Join as Investor</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}

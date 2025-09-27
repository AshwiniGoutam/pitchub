"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="border-b border-border bg-blue">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 grid gap-10 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <h1 className="text-pretty text-4xl/tight md:text-5xl/tight font-semibold">
            The Future of Startup Funding, Simplified.
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Pitchub is building a smarter way for founders and investors to connect, track, and grow together.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard/founder/submit">Join the Waitlist</Link>
            </Button>
            <a
              href="#features"
              className="text-sm md:text-base text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
            >
              Explore features
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[13/10] w-full overflow-hidden rounded-xl border border-border bg-muted">
            {/* Decorative placeholder; replace with real image when available */}
            <img
              src="/images/hero-image.png"
              alt="Preview of Pitchub dashboard interface"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

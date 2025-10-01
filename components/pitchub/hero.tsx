"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <>
      <div><div className="absolute top-10 left-1/4 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-blue-300/15 rounded-full blur-3xl animate-float-slow"></div><div className="absolute top-20 right-1/3 w-64 h-64 bg-gradient-to-br from-sky-200/15 to-blue-200/20 rounded-full blur-2xl animate-float-slow animation-delay-2000"></div><div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-blue-100/25 to-sky-200/20 rounded-full blur-3xl animate-float-slow animation-delay-4000"></div><div className="absolute bottom-10 right-1/4 w-56 h-56 bg-gradient-to-br from-sky-100/20 to-blue-200/15 rounded-full blur-2xl animate-float-slow animation-delay-6000"></div><div className="absolute top-1/3 left-10 w-32 h-32 bg-blue-100/30 rounded-full blur-xl animate-float-gentle"></div><div className="absolute top-2/3 right-10 w-24 h-24 bg-sky-100/25 rounded-full blur-lg animate-float-gentle animation-delay-3000"></div><div className="absolute bottom-1/3 left-1/2 w-40 h-40 bg-blue-50/35 rounded-full blur-xl animate-float-gentle animation-delay-5000"></div><div className="absolute inset-0 bg-grid-pattern opacity-3"></div></div>
      <section className="">
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
            <p>Apply to the right investors and hear back in a week—no more cold emails. Present, manage, and track fundraising with ease.</p>
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
    </>
  )
}

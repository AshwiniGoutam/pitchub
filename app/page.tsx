"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  CheckCircle2,
  Clock,
  BarChart3,
  Rocket,
  Mail,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function PitchubLanding() {
  return (
    <div className="min-h-screen">
      {/* Header */}
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
          {/* <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium px-4 py-2">Join Waitlist</Button> */}
          <button
            className="bg-primary rounded-lg inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium px-4 py-2 text-white cursor-pointer"
            onClick={() =>
              signIn("google", {
                callbackUrl: "/founder-login?role=founder",
              })
            }
          >
            Join the Waitlist
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-secondary to-background py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="gridPattern"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="40"
                  stroke="#e0e0e0"
                  stroke-width="1"
                />
                <line
                  x1="0"
                  y1="0"
                  x2="40"
                  y2="0"
                  stroke="#e0e0e0"
                  stroke-width="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridPattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1.5 bg-accent/20 text-accent-foreground rounded-full text-sm font-semibold">
              Coming Soon
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance">
              Next-Gen Platform for{" "}
              <span className="text-primary font-semibold">
                {" "}
                Startups & Investors
              </span>
            </h1>
            {/* <p className="text-xl md:text-2xl text-muted-foreground mb-4 text-pretty">
              The Future of <span className="text-primary font-semibold">Startup Funding</span>, Simplified.
            </p> */}
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Pitchub is building a smarter way for founders and investors to
              connect, track, and grow together. We make fundraising
              transparent, efficient, and data-driven.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Transparency in funding</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Saves time for founders & investors</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Actionable insights, not just data</span>
              </div>
            </div>
            {/* <Link href={"/dashboard/founder/submit"} className="bg-primary rounded-lg hover:bg-primary/90 text-primary-foreground text-md px-4 py-3">
              Join the Waitlist
            </Link> */}
            <div className="flex gap-2 items-center justify-center">
              <button
                className="bg-primary rounded-lg hover:bg-primary/90 text-primary-foreground text-md px-4 py-3 cursor-pointer"
                onClick={() =>
                  signIn("google", {
                    callbackUrl: "/founder-login?role=founder",
                  })
                }
              >
                Join the Waitlist
              </button>

              <button
                className="bg-primary rounded-lg hover:bg-primary/90 text-primary-foreground text-md px-4 py-3 cursor-pointer"
                onClick={() =>
                  signIn("google", {
                    callbackUrl: "/dashboard/investor",
                  })
                }
              >
                Join as Investor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              About Pitchub
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Pitchub is a next-gen platform designed for startups and
              investors. We make fundraising transparent, efficient, and
              data-driven.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border border-gray-100 bg-card shadow-none">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-3">
                  For Founders
                </h3>
                <p className="text-muted-foreground text-pretty">
                  Apply to the right investors and hear back in a week—no more
                  cold emails. Present, manage, and track fundraising with ease.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 bg-card shadow-none">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-3">
                  For Investors
                </h3>
                <p className="text-muted-foreground text-pretty">
                  Discover quality deal flow, track your portfolio, and make
                  data-driven investment decisions with comprehensive insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Key Features{" "}
              <span className="text-muted-foreground">(Coming Soon)</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="bg-background border border-gray-50 shadow-none">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Investor Dashboard
                </h3>
                <p className="text-sm text-muted-foreground">
                  Insights into portfolio, deal flow, and funding status.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border border-gray-50 shadow-none">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Founder Interface
                </h3>
                <p className="text-sm text-muted-foreground">
                  Simplified pitch creation & performance tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border border-gray-50 shadow-none">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Fund Tracking
                </h3>
                <p className="text-sm text-muted-foreground">
                  Real-time updates on fundraising milestones.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border border-gray-50 shadow-none">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Collaboration Tools
                </h3>
                <p className="text-sm text-muted-foreground">
                  Collaboration tools, feedback loops, and reporting.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Pitchub Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Why Pitchub?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Transparency in Funding
              </h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Clear visibility into the fundraising process with real-time
                updates and honest feedback from investors.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Saves Time
              </h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Streamlined processes for both founders and investors,
                eliminating inefficient cold outreach.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Actionable Insights
              </h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Not just data, but meaningful insights that help make better
                investment and fundraising decisions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Next Generation
              </h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Built for the next generation of venture building with modern
                tools and intelligent matching.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Preview Section */}
      {/* <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Experience the Platform
            </h2>
            <p className="text-lg text-muted-foreground">Investor Dashboard</p>
            <p className="text-sm text-muted-foreground">Insights into portfolio, deal flow, and funding status</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Card className="bg-background border border-gray-50 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <img
                    src="/modern-investor-dashboard-with-charts-and-analytic.jpg"
                    alt="Investor Dashboard Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Early Access Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="mx-auto">
            <Card className="border border-primary/20 bg-card">
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4 text-balance">
                    Early Access
                  </h2>
                  <p className="text-lg text-muted-foreground mb-2">
                    Be the first to experience Pitchub. Join our waitlist and
                    get notified when we launch.
                  </p>
                </div>

                <div className="flex items-center flex-wrap gap-10 justify-center mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Early access notification
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Exclusive features preview
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Priority support
                    </span>
                  </div>
                </div>

                <form className="space-y-4 max-w-xl mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 bg-background"
                    />
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap"
                    >
                      Join Waitlist
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Sign up today and get early access when we launch
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
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
  );
}

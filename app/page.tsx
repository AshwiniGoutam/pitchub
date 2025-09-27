import { Hero } from "@/components/pitchub/hero";
import { About } from "@/components/pitchub/about";
import { Features } from "@/components/pitchub/features";
import { Why } from "@/components/pitchub/why";
import { EarlyAccess } from "@/components/pitchub/early-access";
import { SiteFooter } from "@/components/pitchub/site-footer";
import BlogSection from "@/components/pitchub/blogs";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <a href="/" className="font-semibold tracking-tight">
          <img src="/images/logo.png" alt="logo" width='200px' />
          </a>
          <nav className="hidden sm:flex items-center gap-6">
            <a
              href="#about"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              About
            </a>
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#why"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Why Pitchub
            </a>
          </nav>
          <a
            href="#early-access"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
          >
            Join the Waitlist
          </a>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <About />
        <Features />
        <Why />
        <EarlyAccess />
        <BlogSection/>
      </main>

      <SiteFooter />
    </div>
  );
}

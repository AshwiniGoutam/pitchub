export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="grid gap-8 md:grid-cols-12 items-center">
        <div className="md:col-span-5 space-y-4">
          <img src="/images/about-pitchub.png" alt="about-pitchub" className="rounded-lg" />
        </div>
        <div className="md:col-span-7 space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-dark text-pretty">About Pitchub</h2>
          <p>
            Pitchub is a next-gen platform designed for startups and investors. We make fundraising transparent,
            efficient, and data-driven.
          </p>
          <p>
            <strong className="text-foreground">For Founders</strong> — Apply to the right investors and hear back in a
            week—no more cold emails. Present, manage, and track fundraising with ease.
          </p>
        </div>
      </div>
    </section>
  )
}

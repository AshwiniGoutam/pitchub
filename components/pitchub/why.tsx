export function Why() {
  const reasons = [
    "Transparency in funding.",
    "Saves time for founders & investors.",
    "Actionable insights, not just data.",
    "Built for the next generation of venture building.",
  ]

  return (
    <section id="why" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 className="text-2xl md:text-3xl font-semibold text-pretty">Why Pitchub?</h2>
        </div>
        <div className="md:col-span-7">
          <ul className="grid gap-3">
            {reasons.map((r) => (
              <li key={r} className="leading-relaxed">
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

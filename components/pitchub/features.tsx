import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Investor Dashboard",
    desc: "Insights into portfolio, deal flow, and funding status.",
  },
  {
    title: "Founder Interface",
    desc: "Simplified pitch creation and performance tracking.",
  },
  {
    title: "Fund Tracking Mechanism",
    desc: "Real-time updates on fundraising milestones.",
  },
  {
    title: "Additional Features",
    desc: "Collaboration tools, feedback loops, and reporting.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-16 md:py-20  bg-blue">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-pretty">
            Key Features (Coming Soon)
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((f) => (
            <Card key={f.title} className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {f.desc}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

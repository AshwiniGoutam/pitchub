"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Star } from "lucide-react"

const emails = [
    {
        id: 1,
        from: "Sarah Chen",
        company: "TechVentures Inc",
        subject: "Series B Funding Round - Q1 2024",
        preview: "Excited to share our upcoming Series B round targeting $50M for expansion into Asian markets...",
        date: "Today 9:32 AM",
        starred: true,
        sector: "Technology",
    },
    {
        id: 2,
        from: "Michael Rodriguez",
        company: "BioHealth Solutions",
        subject: "Strategic Partnership Opportunity",
        preview: "We believe there's tremendous synergy between our platforms and would love to discuss collaboration...",
        date: "Today 8:15 AM",
        starred: false,
        sector: "Healthcare",
    },
    {
        id: 3,
        from: "Lisa Wang",
        company: "PayFlow Systems",
        subject: "Re: Initial Pitch Meeting",
        preview: "Thank you for considering our proposal. We've addressed the feedback and have updated metrics...",
        date: "Yesterday 2:45 PM",
        starred: true,
        sector: "Finance",
    },
    {
        id: 4,
        from: "James Patterson",
        company: "RetailConnect Pro",
        subject: "Q4 Performance & Growth Plans",
        preview: "Our platform has achieved 40% YoY growth. We're looking to scale operations across new verticals...",
        date: "Yesterday 11:20 AM",
        starred: false,
        sector: "E-Commerce",
    },
    {
        id: 5,
        from: "Emma Thompson",
        company: "Green Energy Labs",
        subject: "Pre-Series A Pitch Deck",
        preview: "Our renewable energy solution has achieved significant traction with early customers...",
        date: "2 days ago",
        starred: false,
        sector: "Energy",
    },
]

const sectorColors: Record<string, string> = {
    Technology: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    Healthcare: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
    Finance: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    "E-Commerce": "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
    Energy: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
}

export function LatestEmails() {
    return (
        <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Latest Emails</CardTitle>
                        <CardDescription>Inbound pitches and communications</CardDescription>
                    </div>
                    <button className="text-sm text-primary hover:underline">View all</button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    {emails.map((email) => (
                        <div
                            key={email.id}
                            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer border-l-2 border-transparent hover:border-primary"
                        >
                            <div className="flex items-start gap-3 mb-2">
                                <Mail className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <div>
                                            <h3 className="text-sm font-semibold text-foreground truncate">{email.from}</h3>
                                            <p className="text-xs text-muted-foreground truncate">{email.company}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {email.starred && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
                                            <span
                                                className={`text-xs font-medium px-2 py-0.5 rounded ${sectorColors[email.sector] || "bg-gray-100"}`}
                                            >
                                                {email.sector}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-foreground mb-1 truncate">{email.subject}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{email.preview}</p>
                                    <p className="text-xs text-muted-foreground">{email.date}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

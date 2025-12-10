"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"

const newsItems = [
    {
        id: 1,
        title: "Tech Sector Growth",
        description: "Investment in AI startups reaches record high",
        date: "2 hours ago",
        category: "Technology",
    },
    {
        id: 2,
        title: "Market Rally",
        description: "Healthcare stocks surge on new policies",
        date: "4 hours ago",
        category: "Healthcare",
    },
    {
        id: 3,
        title: "Funding Round",
        description: "E-commerce platform secures $100M Series B",
        date: "1 day ago",
        category: "E-Commerce",
    },
    {
        id: 4,
        title: "Regulatory Update",
        description: "New fintech regulations announced",
        date: "2 days ago",
        category: "Finance",
    },
]

export function MarketNews() {
    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            Technology: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
            Healthcare: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
            "E-Commerce": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
            Finance: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        }
        return colors[category] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
    }

    return (
        <Card className="bg-card border-border h-full">
            <CardHeader>
                <CardTitle>Market Research</CardTitle>
                <CardDescription>Latest news & insights</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {newsItems.map((item) => (
                        <div
                            key={item.id}
                            className="border border-border rounded-lg p-3 hover:bg-muted transition-colors cursor-pointer group"
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-1" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-medium px-2 py-1 rounded ${getCategoryColor(item.category)}`}>
                                    {item.category}
                                </span>
                                <span className="text-xs text-muted-foreground">{item.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface Stat {
    title: string
    value: string | number
    change: string
    isPositive: boolean
    description: string
}

interface StatsGridProps {
    stats?: Stat[]
}

const defaultStats: Stat[] = [
    {
        title: "Total Pitches",
        value: "284",
        change: "+12%",
        isPositive: true,
        description: "This month",
    },
    {
        title: "Quality Deal Flow",
        value: "48",
        change: "+8%",
        isPositive: true,
        description: "High potential deals",
    },
    {
        title: "Reviewed",
        value: "156",
        change: "+24%",
        isPositive: true,
        description: "Pitches reviewed",
    },
    {
        title: "Contacted",
        value: "92",
        change: "-3%",
        isPositive: false,
        description: "Active conversations",
    },
]

export function StatsGrid({ stats }: StatsGridProps) {
    console.log(stats);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats?.map((stat) => (
                <Card key={stat.title} className="bg-card border-border hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-end justify-between">
                                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                                <div
                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${stat.isPositive
                                        ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        }`}
                                >
                                    {stat.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {stat.change}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

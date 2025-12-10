"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface DealData {
    sector: string
    deals: number
}

interface DealsChartProps {
    data?: DealData[]
}

const defaultData: DealData[] = [
    { sector: "Technology", deals: 45 },
    { sector: "Healthcare", deals: 38 },
    { sector: "Finance", deals: 32 },
    { sector: "E-Commerce", deals: 28 },
    { sector: "Energy", deals: 22 },
    { sector: "Real Estate", deals: 19 },
]

export function DealsChart({ data = defaultData }: DealsChartProps) {
    const colors = [
        "hsl(var(--color-chart-1))",
        "hsl(var(--color-chart-2))",
        "hsl(var(--color-chart-3))",
        "hsl(var(--color-chart-4))",
        "hsl(var(--color-chart-5))",
        "hsl(41.116 100% 64.6%)",
    ]

    return (
        <Card className="bg-card border-border">
            <CardHeader>
                <CardTitle>Deals by Sector</CardTitle>
                <CardDescription>Distribution of deal flow across industries</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="sector" width={110} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--color-card)",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: "0.625rem",
                                    color: "var(--color-foreground)",
                                }}
                            />
                            <Bar dataKey="deals" radius={[0, 8, 8, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

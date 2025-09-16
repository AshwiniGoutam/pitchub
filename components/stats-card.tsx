import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  trend?: string
  color?: "blue" | "green" | "orange" | "purple"
}

export function StatsCard({ title, value, icon, trend, color = "blue" }: StatsCardProps) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/10 border-blue-200/50 dark:border-blue-800/50",
    green: "from-green-500/20 to-green-600/10 border-green-200/50 dark:border-green-800/50",
    orange: "from-orange-500/20 to-orange-600/10 border-orange-200/50 dark:border-orange-800/50",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-200/50 dark:border-purple-800/50",
  }

  const iconColorClasses = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50",
    green: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50",
    orange: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50",
    purple: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50",
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-gradient-to-br backdrop-blur-sm border-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]",
        colorClasses[color],
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-900/40" />

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
        <div className={cn("p-2.5 rounded-xl", iconColorClasses[color])}>{icon}</div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold text-foreground mb-1">{value.toLocaleString()}</div>
        {trend && <p className="text-sm text-muted-foreground font-medium">{trend}</p>}
      </CardContent>
    </Card>
  )
}

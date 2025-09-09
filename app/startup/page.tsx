import { Suspense } from "react"
import { StartupDashboard } from "@/components/startup/startup-dashboard"

export default function StartupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StartupDashboard />
    </Suspense>
  )
}

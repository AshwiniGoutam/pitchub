import { Suspense } from "react"
import { InvestorDashboard } from "@/components/investor/investor-dashboard"

export default function InvestorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvestorDashboard />
    </Suspense>
  )
}

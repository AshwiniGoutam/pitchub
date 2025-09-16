import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    // Get current date and week ago
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Aggregate statistics
    const [totalPitches, newThisWeek, underReview, contacted] = await Promise.all([
      db.collection("startups").countDocuments(),
      db.collection("startups").countDocuments({ createdAt: { $gte: weekAgo } }),
      db.collection("startups").countDocuments({ status: "under_review" }),
      db.collection("startups").countDocuments({ status: "contacted" }),
    ])

    return NextResponse.json({
      totalPitches,
      newThisWeek,
      underReview,
      contacted,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    // Note: In a real app, you'd filter by the authenticated founder's ID
    const founderId = "temp-founder-id" // This should come from session

    // Aggregate statistics
    const [totalSubmissions, underReview, contacted, avgScoreResult] = await Promise.all([
      db.collection("startups").countDocuments({ founderId }),
      db.collection("startups").countDocuments({ founderId, status: "under_review" }),
      db.collection("startups").countDocuments({ founderId, status: "contacted" }),
      db
        .collection("startups")
        .aggregate([{ $match: { founderId } }, { $group: { _id: null, avgScore: { $avg: "$relevanceScore" } } }])
        .toArray(),
    ])

    const averageScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore : 0

    return NextResponse.json({
      totalSubmissions,
      underReview,
      contacted,
      averageScore,
    })
  } catch (error) {
    console.error("Error fetching founder stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

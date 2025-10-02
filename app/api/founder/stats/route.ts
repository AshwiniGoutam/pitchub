import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    // ✅ 1. Get logged-in user
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // ✅ 2. Use logged-in user’s email as founderId
    const founderId = session.user.email

    // ✅ 3. Aggregate statistics in parallel
    const [totalSubmissions, underReview, contacted, avgScoreResult] = await Promise.all([
      db.collection("startups").countDocuments({ founderId }),
      db.collection("startups").countDocuments({ founderId, status: "under_review" }),
      db.collection("startups").countDocuments({ founderId, status: "contacted" }),
      db
        .collection("startups")
        .aggregate([
          { $match: { founderId } },
          { $group: { _id: null, avgScore: { $avg: "$relevanceScore" } } },
        ])
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

import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { MatchingEngine, type InvestorThesis } from "@/lib/matching-engine"

export async function POST(request: NextRequest) {
  try {
    const { investorThesis, startupIds } = await request.json()

    if (!investorThesis) {
      return NextResponse.json({ message: "Investor thesis is required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get startups to match against
    const query = startupIds ? { _id: { $in: startupIds } } : {}
    const startups = await db.collection("startups").find(query).toArray()

    // Run matching engine
    const matchingResults = MatchingEngine.batchMatch(startups, investorThesis as InvestorThesis)

    // Store matching results in database
    if (matchingResults.length > 0) {
      await db.collection("matchingResults").insertMany(matchingResults)
    }

    // Update startup relevance scores
    for (const result of matchingResults) {
      await db.collection("startups").updateOne(
        { _id: result.startupId },
        {
          $set: {
            relevanceScore: result.relevanceScore,
            updatedAt: new Date(),
          },
        },
      )
    }

    return NextResponse.json({
      message: "Matching completed successfully",
      results: matchingResults,
      processed: startups.length,
    })
  } catch (error) {
    console.error("Error running matching engine:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

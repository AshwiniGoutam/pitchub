import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    // Fetch all startups sorted by relevance score and creation date
    const startups = await db
      .collection("startups")
      .find({})
      .sort({ relevanceScore: -1, createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json(startups)
  } catch (error) {
    console.error("Error fetching startups:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

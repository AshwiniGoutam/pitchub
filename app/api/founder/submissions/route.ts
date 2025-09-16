import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    // Note: In a real app, you'd filter by the authenticated founder's ID
    const founderId = "temp-founder-id" // This should come from session

    // Fetch founder's submissions
    const submissions = await db.collection("startups").find({ founderId }).sort({ createdAt: -1 }).toArray()

    // Add mock investor responses count (would be real data in production)
    const submissionsWithResponses = submissions.map((submission) => ({
      ...submission,
      investorResponses: Math.floor(Math.random() * 5), // Mock data
    }))

    return NextResponse.json(submissionsWithResponses)
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

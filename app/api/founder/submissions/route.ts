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

    // ✅ 3. Fetch founder’s submissions
    const submissions = await db
      .collection("startups")
      .find({ founderId })
      .sort({ createdAt: -1 })
      .toArray()

    // ✅ 4. Add mock investor responses (optional)
    const submissionsWithResponses = submissions.map((submission) => ({
      ...submission,
      investorResponses: Math.floor(Math.random() * 5), // mock data
    }))

    return NextResponse.json(submissionsWithResponses)
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

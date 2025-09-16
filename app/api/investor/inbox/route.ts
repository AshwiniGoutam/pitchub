import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const starred = searchParams.get("starred")

    // Build query filter
    const filter: any = {}

    if (status && status !== "all") {
      if (status === "unread") {
        filter.isRead = false
      } else if (status === "starred") {
        filter.isStarred = true
      } else {
        filter.status = status
      }
    }

    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: "i" } },
        { from: { $regex: search, $options: "i" } },
        { preview: { $regex: search, $options: "i" } },
      ]
    }

    if (starred === "true") {
      filter.isStarred = true
    }

    const emails = await db.collection("emails").find(filter).sort({ timestamp: -1 }).limit(50).toArray()

    return NextResponse.json({ emails })
  } catch (error) {
    console.error("Error fetching emails:", error)
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const { emailId, updates } = await request.json()

    const result = await db.collection("emails").updateOne({ _id: emailId }, { $set: updates })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating email:", error)
    return NextResponse.json({ error: "Failed to update email" }, { status: 500 })
  }
}

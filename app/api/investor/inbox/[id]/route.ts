import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const emailId = params.id

    const email = await db.collection("emails").findOne({
      _id: new ObjectId(emailId),
    })

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 })
    }

    // Mark as read when fetched
    await db.collection("emails").updateOne({ _id: new ObjectId(emailId) }, { $set: { isRead: true } })

    return NextResponse.json({ email })
  } catch (error) {
    console.error("Error fetching email:", error)
    return NextResponse.json({ error: "Failed to fetch email" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const emailId = params.id
    const updates = await request.json()

    const result = await db.collection("emails").updateOne({ _id: new ObjectId(emailId) }, { $set: updates })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating email:", error)
    return NextResponse.json({ error: "Failed to update email" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const db = await getDatabase()

    const result = await db.collection("startups").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Startup not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Status updated successfully" })
  } catch (error) {
    console.error("Error updating status:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

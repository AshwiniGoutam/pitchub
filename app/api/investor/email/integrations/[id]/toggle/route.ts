import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { isActive } = await request.json()
    const db = await getDatabase()

    const result = await db.collection("emailIntegrations").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          isActive,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Integration not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Integration status updated successfully" })
  } catch (error) {
    console.error("Error updating integration status:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

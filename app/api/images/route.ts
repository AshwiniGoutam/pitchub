import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get("folder")
    const userId = searchParams.get("userId") || "temp-user-id" // Would come from session

    const db = await getDatabase()

    // Build query
    const query: any = { userId }
    if (folder) {
      query.folder = folder
    }

    const images = await db.collection("uploads").find(query).sort({ uploadedAt: -1 }).toArray()

    return NextResponse.json(images)
  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, name, type, size, folder, publicId } = await request.json()

    if (!url || !name) {
      return NextResponse.json({ message: "URL and name are required" }, { status: 400 })
    }

    const db = await getDatabase()

    const imageData = {
      url,
      name,
      type: type || "unknown",
      size: size || 0,
      folder: folder || "general",
      publicId: publicId || "",
      userId: "temp-user-id", // Would come from session
      uploadedAt: new Date(),
    }

    const result = await db.collection("uploads").insertOne(imageData)

    return NextResponse.json({
      message: "Image record created successfully",
      id: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating image record:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

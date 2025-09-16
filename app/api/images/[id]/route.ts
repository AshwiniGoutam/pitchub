import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import cloudinary from "@/lib/cloudinary"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase()

    // Get image record
    const image = await db.collection("uploads").findOne({ _id: new ObjectId(params.id) })

    if (!image) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 })
    }

    // Delete from Cloudinary if publicId exists
    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId)
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError)
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete from database
    await db.collection("uploads").deleteOne({ _id: new ObjectId(params.id) })

    return NextResponse.json({ message: "Image deleted successfully" })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

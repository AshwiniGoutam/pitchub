import { type NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "general"

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ message: "File size must be less than 10MB" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: "File type not supported" }, { status: 400 })
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(file, folder)

    return NextResponse.json({
      message: "File uploaded successfully",
      url: (uploadResult as any).secure_url,
      publicId: (uploadResult as any).public_id,
      format: (uploadResult as any).format,
      size: (uploadResult as any).bytes,
      width: (uploadResult as any).width,
      height: (uploadResult as any).height,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ message: "Upload failed" }, { status: 500 })
  }
}

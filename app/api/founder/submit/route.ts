import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { uploadToCloudinary } from "@/lib/cloudinary"
import type { Startup } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form fields
    const name = formData.get("name") as string
    const sector = formData.get("sector") as string
    const stage = formData.get("stage") as string
    const location = formData.get("location") as string
    const fundingMin = Number.parseInt(formData.get("fundingMin") as string)
    const fundingMax = Number.parseInt(formData.get("fundingMax") as string)
    const description = formData.get("description") as string
    const website = formData.get("website") as string
    const teamSize = formData.get("teamSize") as string
    const pitchDeckFile = formData.get("pitchDeck") as File

    // Validate required fields
    if (!name || !sector || !stage || !location || !fundingMin || !fundingMax || !description) {
      return NextResponse.json({ message: "All required fields must be filled" }, { status: 400 })
    }

    let pitchDeckUrl = ""

    // Upload pitch deck to Cloudinary if provided
    if (pitchDeckFile && pitchDeckFile.size > 0) {
      try {
        const uploadResult = await uploadToCloudinary(pitchDeckFile, "pitch-decks")
        pitchDeckUrl = (uploadResult as any).secure_url
      } catch (uploadError) {
        console.error("Error uploading pitch deck:", uploadError)
        return NextResponse.json({ message: "Error uploading pitch deck" }, { status: 500 })
      }
    }

    // Calculate basic relevance score (this would be enhanced with AI matching)
    const relevanceScore = calculateRelevanceScore(sector, stage, fundingMin, fundingMax)

    // Create startup object
    const startupData: Partial<Startup> = {
      name,
      sector,
      stage,
      location,
      fundingRequirement: {
        min: fundingMin,
        max: fundingMax,
      },
      description,
      pitchDeck: pitchDeckUrl,
      relevanceScore,
      status: "submitted",
      createdAt: new Date(),
      updatedAt: new Date(),
      // Note: founderId would come from authenticated user session
      founderId: "temp-founder-id", // This should be replaced with actual user ID from session
    }

    // Add optional fields
    if (website) {
      ;(startupData as any).website = website
    }
    if (teamSize) {
      ;(startupData as any).teamSize = Number.parseInt(teamSize)
    }

    const db = await getDatabase()
    const result = await db.collection("startups").insertOne(startupData)

    return NextResponse.json({
      message: "Pitch submitted successfully",
      startupId: result.insertedId,
      relevanceScore,
    })
  } catch (error) {
    console.error("Error submitting pitch:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Basic relevance scoring algorithm (would be enhanced with AI)
function calculateRelevanceScore(sector: string, stage: string, fundingMin: number, fundingMax: number): number {
  let score = 50 // Base score

  // Sector scoring (popular sectors get higher scores)
  const popularSectors = ["Fintech", "AI/ML", "SaaS", "HealthTech"]
  if (popularSectors.includes(sector)) {
    score += 20
  }

  // Stage scoring (early stages are more common)
  if (stage === "Seed" || stage === "Pre-Seed") {
    score += 15
  } else if (stage === "Series A") {
    score += 10
  }

  // Funding range scoring (reasonable ranges get higher scores)
  const avgFunding = (fundingMin + fundingMax) / 2
  if (avgFunding >= 100000 && avgFunding <= 2000000) {
    score += 15
  }

  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, score))
}

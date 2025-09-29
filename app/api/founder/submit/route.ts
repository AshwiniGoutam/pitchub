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
    const relevanceScore = await calculateRelevanceScore(sector, stage, fundingMin, fundingMax)

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
      ; (startupData as any).website = website
    }
    if (teamSize) {
      ; (startupData as any).teamSize = Number.parseInt(teamSize)
    }

    const db = await getDatabase()
    const result = await db.collection("startups").insertOne(startupData)

    return NextResponse.json({
      message: "Pitch submitted successfully",
      startupId: result.insertedId,
      relevanceScore, // now this is a number
    })

  } catch (error) {
    console.error("Error submitting pitch:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Basic relevance scoring algorithm (would be enhanced with AI)
// Dynamic relevance scoring based on investor preferences
async function calculateRelevanceScore(
  sector: string,
  stage: string,
  fundingMin: number,
  fundingMax: number
): Promise<number> {
  const db = await getDatabase()

  // 🔹 Replace with actual logged-in investor ID
  const investorId = "investor-temp-id"

  let score = 50 // default base score

  try {
    const investorProfile = await db
      .collection("startups")
      .findOne({ _id: new (require("mongodb").ObjectId)(investorId) })

    if (!investorProfile) return score // fallback if no investor found

    // Sector match
    if (investorProfile.sectors?.includes(sector)) score += 30

    // Stage match
    if (investorProfile.stages?.includes(stage)) score += 25

    // Funding range overlap
    if (investorProfile.fundingRange) {
      const overlap =
        Math.min(fundingMax, investorProfile.fundingRange.max) -
        Math.max(fundingMin, investorProfile.fundingRange.min)
      if (overlap > 0) score += 25
    }

    // Location match
    if (investorProfile.locations?.includes("any")) score += 15 // optional default
    else if (investorProfile.locations?.includes(location)) score += 15

    // Team size match (optional)
    if (investorProfile.maxTeamSize && fundingMax <= investorProfile.maxTeamSize) score += 5

  } catch (error) {
    console.error("Error calculating relevance:", error)
  }

  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, score))
}


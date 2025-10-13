import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Startup } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { sendPitchSubmissionEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    // ✅ 1. Get logged-in user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ 2. Extract form data
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const sector = formData.get("sector") as string;
    const stage = formData.get("stage") as string;
    const location = formData.get("location") as string;
    const fundingMin = Number.parseInt(formData.get("fundingMin") as string);
    const fundingMax = Number.parseInt(formData.get("fundingMax") as string);
    const description = formData.get("description") as string;
    const website = formData.get("website") as string;
    const teamSize = formData.get("teamSize") as string;
    const pitchDeckFile = formData.get("pitchDeck") as File;

    if (
      !name ||
      !sector ||
      !stage ||
      !location ||
      !fundingMin ||
      !fundingMax ||
      !description
    ) {
      return NextResponse.json(
        { message: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // ✅ 3. Upload pitch deck (if exists)
    let pitchDeckUrl = "";
    if (pitchDeckFile && pitchDeckFile.size > 0) {
      try {
        const uploadResult = await uploadToCloudinary(
          pitchDeckFile,
          "pitch-decks"
        );
        pitchDeckUrl = (uploadResult as any).secure_url;
      } catch (uploadError) {
        console.error("Error uploading pitch deck:", uploadError);
        return NextResponse.json(
          { message: "Error uploading pitch deck" },
          { status: 500 }
        );
      }
    }

    // ✅ 4. Relevance score (placeholder or AI matching later)
    const relevanceScore = 50; // baseline or your algorithm

    // ✅ 5. Create startup document
    const startupData: Omit<Partial<Startup>, "_id"> & { teamSize?: number } = {
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
      founderId: session.user.email, // 👈 now linked to Gmail user
    };

    // Ensure _id is not present to avoid type conflict
    delete (startupData as any)._id;

    if (website) (startupData as any).website = website;
    if (teamSize) startupData.teamSize = Number.parseInt(teamSize);

    // ✅ 6. Insert into DB
    const db = await getDatabase();
    const result = await db.collection("startups").insertOne(startupData);

    // return NextResponse.json({
    //   message: "Pitch submitted successfully",
    //   startupId: result.insertedId,
    //   relevanceScore,
    // })
    try {
      await sendPitchSubmissionEmail(session.user.email, name);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don’t break the flow if email fails
    }

    return NextResponse.json({
      message: "Pitch submitted successfully",
      startupId: result.insertedId,
      relevanceScore,
    });
  } catch (error) {
    console.error("Error submitting pitch:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

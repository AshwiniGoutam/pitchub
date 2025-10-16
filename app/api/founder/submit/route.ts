import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Startup } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { sendPitchSubmissionEmail } from "@/lib/mail";
import { supabaseServer } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const sector = formData.get("sector") as string;
    const stage = formData.get("stage") as string;
    const location = formData.get("location") as string;
    const fundingMin = Number(formData.get("fundingMin"));
    const fundingMax = Number(formData.get("fundingMax"));
    const description = formData.get("description") as string;
    const website = formData.get("website") as string | null;
    const teamSize = formData.get("teamSize") as string | null;
    const pitchDeckFile = formData.get("pitchDeck") as File | null;

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

    // ✅ Upload pitch deck to Supabase Storage
    let pitchDeckUrl = "";
    if (pitchDeckFile && pitchDeckFile.size > 0) {
      const fileName = `${Date.now()}-${pitchDeckFile.name}`;
      const arrayBuffer = await pitchDeckFile.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      const { data, error } = await supabaseServer.storage
        .from("pitchub") // <-- your bucket name
        .upload(fileName, fileBuffer, {
          contentType: pitchDeckFile.type,
          upsert: true,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return NextResponse.json(
          { message: "Error uploading pitch deck" },
          { status: 500 }
        );
      }

      const { data: publicData, error: publicError } = supabaseServer.storage
        .from("pitchub")
        .getPublicUrl(fileName);

      if (publicError) {
        console.error("Supabase public URL error:", publicError);
        return NextResponse.json(
          { message: "Error getting public URL" },
          { status: 500 }
        );
      }

      pitchDeckUrl = publicData.publicUrl;
    }

    // Relevance score (placeholder)
    const relevanceScore = 50;

    // Prepare startup data
    const startupData: Omit<Partial<Startup>, "_id"> & { teamSize?: number } = {
      name,
      sector,
      stage,
      location,
      fundingRequirement: { min: fundingMin, max: fundingMax },
      description,
      pitchDeck: pitchDeckUrl,
      relevanceScore,
      status: "submitted",
      createdAt: new Date(),
      updatedAt: new Date(),
      founderId: session.user.email,
    };

    if (website) (startupData as any).website = website;
    if (teamSize) startupData.teamSize = Number.parseInt(teamSize);

    const db = await getDatabase();
    const result = await db.collection("startups").insertOne(startupData);

    sendPitchSubmissionEmail(session.user.email, name).catch(console.error);

    return NextResponse.json({
      message: "Pitch submitted successfully",
      startupId: result.insertedId,
      relevanceScore,
      pitchDeckUrl,
    });
  } catch (error) {
    console.error("Error submitting pitch:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

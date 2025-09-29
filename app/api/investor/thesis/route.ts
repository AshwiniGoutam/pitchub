import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ThesisManager, type InvestorThesis } from "@/lib/matching-engine";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET investor thesis
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const investor = await db.collection("users").findOne({ email: session.user.email });

    if (!investor || !investor.investorProfile) {
      return NextResponse.json(ThesisManager.getDefaultThesis(), { status: 200 });
    }

    const thesis: InvestorThesis = {
      sectors: investor.investorProfile.sectors || [],
      stages: investor.investorProfile.stagePreference || [],
      checkSizeMin: investor.investorProfile.checkSize?.min || 0,
      checkSizeMax: investor.investorProfile.checkSize?.max || 0,
      geographies: investor.investorProfile.geographies || [],
      keywords: investor.investorProfile.keywords || [],
      excludedKeywords: investor.investorProfile.excludedKeywords || [],
    };

    return NextResponse.json(thesis, { status: 200 });
  } catch (error) {
    console.error("Error fetching investor thesis:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PUT / update investor thesis
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let thesis: InvestorThesis;
    try {
      thesis = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    // Validate incoming thesis
    const validation = ThesisManager.validateThesis(thesis);
    if (!validation.isValid) {
      return NextResponse.json({ message: "Invalid thesis", errors: validation.errors }, { status: 400 });
    }

    const db = await getDatabase();

    // Build dynamic $set object to prevent overwriting fields with undefined
    const updateData: any = { updatedAt: new Date() };

    if (thesis.sectors) updateData["investorProfile.sectors"] = thesis.sectors;
    if (thesis.stages) updateData["investorProfile.stagePreference"] = thesis.stages;
    if (
      thesis.checkSizeMin !== undefined &&
      thesis.checkSizeMax !== undefined
    ) {
      updateData["investorProfile.checkSize"] = {
        min: thesis.checkSizeMin,
        max: thesis.checkSizeMax,
      };
    }
    if (thesis.geographies) updateData["investorProfile.geographies"] = thesis.geographies;
    if (thesis.keywords) updateData["investorProfile.keywords"] = thesis.keywords;
    if (thesis.excludedKeywords) updateData["investorProfile.excludedKeywords"] = thesis.excludedKeywords;

    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Investor not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Investment thesis updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating investor thesis:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

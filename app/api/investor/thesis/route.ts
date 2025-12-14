import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ThesisManager, type InvestorThesis } from "@/lib/matching-engine";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// ✅ Reusable helper (used internally in Gmail API)
export async function getInvestorThesisByEmail(userEmail: string) {
  const db = await getDatabase();
  const investor = await db.collection("users").findOne({ email: userEmail });

  if (!investor || !investor.investorProfile) {
    return ThesisManager.getDefaultThesis();
  }

  return {
    sectors: investor.investorProfile.sectors || [],
    stages: investor.investorProfile.stagePreference || [],
    checkSizeMin: investor.investorProfile.checkSize?.min || 0,
    checkSizeMax: investor.investorProfile.checkSize?.max || 0,
    geographies: investor.investorProfile.geographies || [],
    keywords: investor.investorProfile.keywords || [],
    excludedKeywords: investor.investorProfile.excludedKeywords || [],
  };
}

// GET investor thesis
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const investor = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!investor || !investor.investorProfile) {
      return NextResponse.json(ThesisManager.getDefaultThesis(), {
        status: 200,
      });
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
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT / update investor thesis
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const thesis: InvestorThesis = await request.json();

    const validation = ThesisManager.validateThesis(thesis);
    if (!validation.isValid) {
      return NextResponse.json(
        { message: "Invalid thesis", errors: validation.errors },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const updateData = {
      investorProfile: {
        sectors: thesis.sectors || [],
        stagePreference: thesis.stages || [],
        checkSize: {
          min: thesis.checkSizeMin || 0,
          max: thesis.checkSizeMax || 0,
        },
        geographies: thesis.geographies || [],
        keywords: thesis.keywords || [],
        excludedKeywords: thesis.excludedKeywords || [],
      },
      updatedAt: new Date(),
    };

    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: updateData },
      { upsert: true } // ✅ VERY IMPORTANT
    );

    return NextResponse.json(
      { message: "Investment thesis updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT thesis error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

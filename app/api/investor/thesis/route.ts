import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ThesisManager, type InvestorThesis } from "@/lib/matching-engine";
import { ObjectId } from "mongodb";

function getUserIdFromRequest(request: NextRequest) {
  const id = request.headers.get("x-user-id");
  if (!id) return null;

  // Try to convert to ObjectId if possible
  try {
    return new ObjectId(id);
  } catch {
    return id; // fallback: treat as string _id
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const investor = await db.collection("users").findOne({ _id: userId });

    if (!investor || !investor.investorProfile) {
      return NextResponse.json(ThesisManager.getDefaultThesis());
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

    return NextResponse.json(thesis);
  } catch (error) {
    console.error("Error fetching investor thesis:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDatabase();
    const userId = getUserIdFromRequest(request);

    if (!userId) {
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

    const result = await db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          "investorProfile.sectors": thesis.sectors,
          "investorProfile.stagePreference": thesis.stages,
          "investorProfile.checkSize": {
            min: thesis.checkSizeMin,
            max: thesis.checkSizeMax,
          },
          "investorProfile.geographies": thesis.geographies,
          "investorProfile.keywords": thesis.keywords,
          "investorProfile.excludedKeywords": thesis.excludedKeywords,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Investor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Investment thesis updated successfully",
    });
  } catch (error) {
    console.error("Error updating investor thesis:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

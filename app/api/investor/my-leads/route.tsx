import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { MatchingEngine, InvestorThesis } from "@/lib/matching-engine";

function safeDate(value) {
  if (!value) return new Date();

  // Handle MongoDB extended JSON format
  if (typeof value === "object" && value.$date) {
    return new Date(value.$date);
  }

  return new Date(value);
}

export async function GET() {
  try {
    const db = await getDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    // Fetch leads
    const leads = await db
      .collection("leads")
      .find({ investorId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch investor thesis
    const thesisData = await db.collection("investorTheses").findOne({
      investorId: session.user.id,
    });

    const investorThesis: InvestorThesis = thesisData || {
      sectors: [],
      stages: [],
      checkSizeMin: 0,
      checkSizeMax: 0,
      geographies: [],
      keywords: [],
      excludedKeywords: [],
    };

    // Normalize leads
    const safeLeads = leads.map((lead) => ({
      _id: lead._id,
      startupName: lead.startupName || "",
      founderName: lead.founderName || "",
      sector: lead.sector || "",
      stage: lead.stage || "",
      location: lead.location || "",
      description: lead.description || "",
      email: lead.email || "",
      fundingRequirement: {
        min: Number(lead.minInvestment) || 0,
        max: Number(lead.maxInvestment) || 0,
      },
      createdAt: safeDate(lead.createdAt),
    }));

    // Add relevance score
    const leadsWithScore = safeLeads.map((lead) => {
      const { score, reasoning } = MatchingEngine.calculateRelevanceScore(
        lead,
        investorThesis
      );

      return {
        ...lead,
        relevanceScore: score,
        matchingReasoning: reasoning,
      };
    });

    return NextResponse.json(leadsWithScore, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Error fetching leads:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

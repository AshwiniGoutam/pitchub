import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { MatchingEngine, ThesisManager } from "@/lib/matching-engine"; // your engine file
import type { InvestorThesis } from "@/lib/matching-engine";

export async function POST(request: NextRequest) {
    try {
        const db = await getDatabase();
        const body = await request.json();

        const {
            investorId,
            startupName,
            founderName,
            email,
            sector,
            stage,
            minInvestment,
            maxInvestment,
            location,
            description,
            investorThesis: thesisData, // optional: pass investor thesis, else default
        } = body;

        // Check required fields
        if (!investorId || !startupName || !founderName || !sector || !email || !location || !stage || !minInvestment || !maxInvestment) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Prepare lead object
        const newLead = {
            investorId,
            startupName,
            founderName,
            email,
            sector,
            stage,
            fundingRequirement: {
                min: Number(minInvestment),
                max: Number(maxInvestment),
            },
            location,
            description: description || "",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Get investor thesis
        let investorThesis: InvestorThesis;
        if (thesisData) {
            investorThesis = ThesisManager.deserializeThesis(JSON.stringify(thesisData));
        } else {
            investorThesis = ThesisManager.getDefaultThesis();
        }

        // Calculate relevance score
        const { score, factors, reasoning } = MatchingEngine.calculateRelevanceScore(newLead, investorThesis);

        // Add score & reasoning to lead
        newLead.relevanceScore = score;
        newLead.matchingFactors = reasoning;

        // Save to DB
        await db.collection("leads").insertOne(newLead);

        return NextResponse.json({ success: true, lead: newLead });
    } catch (err) {
        console.error("Error saving lead:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

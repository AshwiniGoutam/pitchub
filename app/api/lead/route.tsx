import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { MatchingEngine, ThesisManager } from "@/lib/matching-engine";
import type { InvestorThesis } from "@/lib/matching-engine";
import { supabaseServer } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
    try {
        const db = await getDatabase();

        // ✅ Read multipart/form-data
        const formData = await request.formData();

        // ✅ Extract fields
        const investorId = formData.get("investorId") as string;
        const startupName = formData.get("startupName") as string;
        const founderName = formData.get("founderName") as string;
        const email = formData.get("email") as string;
        const sector = formData.get("sector") as string;
        const stage = formData.get("stage") as string;
        const minInvestment = formData.get("minInvestment") as string;
        const maxInvestment = formData.get("maxInvestment") as string;
        const location = formData.get("location") as string;
        const description = formData.get("description") as string;
        const competitorsData = formData.get("competitorsData") as string;
        const pitchDeckFile = formData.get("pitchDeck") as File | null;

        // ✅ Validate required fields
        if (
            !investorId ||
            !startupName ||
            !founderName ||
            !email ||
            !sector ||
            !stage ||
            !location ||
            !minInvestment ||
            !maxInvestment
        ) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // -------------------------------
        // ✅ Upload pitch deck to Supabase
        // -------------------------------
        let pitchDeckUrl = "";

        if (pitchDeckFile && pitchDeckFile.size > 0) {
            const fileName = `${investorId}/${Date.now()}-${pitchDeckFile.name}`;
            const buffer = Buffer.from(await pitchDeckFile.arrayBuffer());

            const { error } = await supabaseServer.storage
                .from("pitchub")
                .upload(fileName, buffer, {
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

            const { data } = supabaseServer.storage
                .from("pitchub")
                .getPublicUrl(fileName);

            pitchDeckUrl = data.publicUrl;
        }

        // -------------------------------
        // ✅ Prepare lead object
        // -------------------------------
        const newLead: any = {
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
            competitorsData: competitorsData || "",
            pitchDeck: pitchDeckUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // -------------------------------
        // ✅ Investor thesis
        // -------------------------------
        const investorThesis: InvestorThesis =
            ThesisManager.getDefaultThesis();

        const { score, reasoning } =
            MatchingEngine.calculateRelevanceScore(
                newLead,
                investorThesis
            );

        newLead.relevanceScore = score;
        newLead.matchingFactors = reasoning;

        // -------------------------------
        // ✅ Save to MongoDB
        // -------------------------------
        await db.collection("leads").insertOne(newLead);

        return NextResponse.json({ success: true, lead: newLead });
    } catch (err) {
        console.error("Error saving lead:", err);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

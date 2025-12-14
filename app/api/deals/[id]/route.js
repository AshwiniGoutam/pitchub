import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();

    // ✅ 1️⃣ Fetch deal metadata from accepted_pitches
    const deal = await db.collection("accepted_pitches").findOne({
      userEmail: session.user.email,
      emailId: params.id, // dealId === emailId
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: "success",
      data: {
        dealId: deal.emailId,
        founderName: deal.from,
        founderEmail: deal.fromEmail,
        sector: deal.sector,
        growthStage: deal.growthStage,
        summary: deal.summary,
        createdAt: deal.createdAt,
      },
    });
  } catch (error) {
    console.error("GET DEAL ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch deal" },
      { status: 500 }
    );
  }
}

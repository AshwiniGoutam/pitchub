import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    if (!data || !Array.isArray(data.analyses)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection("accepted_pitches");

    const storedResults = await Promise.all(
      data.analyses.map(async (item) => {
        const record = {
          userEmail: session.user.email,
          emailId: item.emailId, // gmailId of that mail
          from: item.from,
          fromEmail: item.fromEmail,
          summary: item.analysis.summary,
          sector: item.analysis.sector,
          competitiveAnalysis: item.analysis.competitiveAnalysis || [],
          marketResearch: item.analysis.marketResearch,
          fundingMentioned: item.analysis.fundingMentioned,
          growthStage: item.analysis.growthStage,
          createdAt: new Date(),
        };

        await collection.updateOne(
          { userEmail: session.user.email, emailId: item.emailId },
          { $set: record },
          { upsert: true }
        );

        return record;
      })
    );

    return NextResponse.json({
      status: "success",
      message: "Pitch accepted and stored successfully",
      stored: storedResults.length,
      data: storedResults,
    });
  } catch (error) {
    console.error("Pitch Accept API Error:", error);
    return NextResponse.json(
      { error: "Failed to store pitch data", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const collection = db.collection("accepted_pitches");

    const deals = await collection
      .find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ status: "success", data: deals });
  } catch (error) {
    console.error("Deals GET API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals", details: error.message },
      { status: 500 }
    );
  }
}

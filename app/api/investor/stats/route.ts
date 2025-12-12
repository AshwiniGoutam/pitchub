import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const db = await getDatabase();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;

    // 📅 Dates
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); 
    const accepted_pitches = await db.collection("accepted_pitches").countDocuments({ userEmail });


    // 📊 Parallel queries (filtered by user)
    const [
      totalPitches,
      newThisWeek,
      underReview,
      dealsThisMonth,
      dealsLastMonth,
      contacted,
    ] = await Promise.all([
      db.collection("startups").countDocuments({ createdBy: userEmail }),
      db
        .collection("startups")
        .countDocuments({ createdBy: userEmail, createdAt: { $gte: weekAgo } }),
      db
        .collection("startups")
        .countDocuments({ createdBy: userEmail, status: "under_review" }),
      db.collection("accepted_pitches").countDocuments({
        userEmail,
        status: { $ne: "rejected" },
        createdAt: { $gte: startOfThisMonth, $lte: now },
      }),
      db.collection("accepted_pitches").countDocuments({
        userEmail,
        status: { $ne: "rejected" },
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      db.collection("user_startup_status").countDocuments({
        userEmail,
        status: "contacted",
      }),
      db.collection("accepted_pitches").find({ userEmail }),
    ]);

    // 📈 Growth calculation
    const dealGrowth =
      dealsLastMonth > 0
        ? ((dealsThisMonth - dealsLastMonth) / dealsLastMonth) * 100
        : 0;

    return NextResponse.json(
      {
        totalPitches,
        newThisWeek,
        underReview,
        contacted,
        deals: {
          total: dealsThisMonth,
          growth: parseFloat(dealGrowth.toFixed(2)),
        },
        acceptedPitches: accepted_pitches,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

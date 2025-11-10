import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic"; // ensures fresh data in App Router

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const db = await getDatabase();

    // 📅 Current date ranges
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 📊 Parallel aggregate queries
    const [
      totalPitches,
      newThisWeek,
      underReview,
      dealsThisMonth,
      dealsLastMonth,
    ] = await Promise.all([
      db.collection("startups").countDocuments(),
      db.collection("startups").countDocuments({ createdAt: { $gte: weekAgo } }),
      db.collection("startups").countDocuments({ status: "under_review" }),
      db.collection("accepted_pitches").countDocuments({
        createdAt: { $gte: startOfThisMonth, $lte: now },
      }),
      db.collection("accepted_pitches").countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
    ]);

    // 👥 User-specific contacted count
    let contacted = 0;
    if (session?.user?.email) {
      contacted = await db.collection("user_startup_status").countDocuments({
        userEmail: session.user.email,
        status: "contacted",
      });
    }

    // 📈 Calculate monthly growth percentage for deals
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
          growth: parseFloat(dealGrowth.toFixed(2)), // example: 12.45
        },
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

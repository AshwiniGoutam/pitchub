import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic"; // ensures fresh data in App Router

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const db = await getDatabase();

    // Get current date and a week ago
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Aggregate global stats
    const [totalPitches, newThisWeek, underReview] = await Promise.all([
      db.collection("startups").countDocuments(),
      db.collection("startups").countDocuments({ createdAt: { $gte: weekAgo } }),
      db.collection("startups").countDocuments({ status: "under_review" }),
    ]);

    // User-specific contacted count
    let contacted = 0;
    if (session?.user?.email) {
      contacted = await db.collection("user_startup_status").countDocuments({
        userEmail: session.user.email,
        status: "contacted",
      });
    }

    return NextResponse.json(
      {
        totalPitches,
        newThisWeek,
        underReview,
        contacted,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

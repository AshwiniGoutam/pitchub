import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const session = await getServerSession(authOptions);

    const startups = await db
      .collection("startups")
      .find({})
      .sort({ relevanceScore: -1, createdAt: -1 })
      .limit(50)
      .toArray();

    let userStatuses: Record<string, string> = {};
    if (session?.user?.email) {
      const statuses = await db
        .collection("user_startup_status")
        .find({ userEmail: session.user.email })
        .toArray();
      userStatuses = Object.fromEntries(
        statuses.map(s => [s.startupId.toString(), s.status])
      );
    }

    const startupsWithStatus = startups.map(s => ({
      ...s,
      status: userStatuses[s._id.toString()] || "not_contacted"
    }));

    return NextResponse.json(startupsWithStatus, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching startups:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

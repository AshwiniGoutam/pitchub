import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 });
    }

    const db = await getDatabase();

    // Ensure this update only affects the current user
    const result = await db.collection("user_startup_status").updateOne(
      { userEmail: session.user.email, startupId: new ObjectId(params.id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: "User-specific startup status updated",
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId,
    });
  } catch (error) {
    console.error("Error updating user startup status:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

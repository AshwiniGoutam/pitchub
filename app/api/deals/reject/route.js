import { getDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, from, fromEmail, subject, sector, status, relevanceScore, timestamp, attachments, isRead, isStarred, createdAt } = body;

    if (!id) {
      return Response.json({ error: "emailId is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const rejectedCollection = db.collection("rejected_pitches");

    // ✅ Prevent duplicate entries
    const existing = await rejectedCollection.findOne({
      userEmail: session.user.email,
      emailId: id,
    });

    if (!existing) {
      await rejectedCollection.insertOne({
        userEmail: session.user.email,
        emailId: id,
        from,
        fromEmail,
        subject,
        sector,
        status,
        relevanceScore,
        timestamp,
        attachments,
        isRead,
        isStarred,
        createdAt,
        rejected: true,
        rejectedAt: new Date(),
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error rejecting pitch:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

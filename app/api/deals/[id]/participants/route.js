import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const db = await getDatabase();

        // Fetch all messages for the deal
        const messages = await db
            .collection("deal_messages")
            .find({ dealId: params.id })
            .toArray();

        // Extract unique participant emails
        const participantEmails = [
            ...new Set(messages.map((m) => m.senderEmail)),
        ];

        // Optional: Fetch user details from users collection
        const users = await db
            .collection("users")
            .find({ email: { $in: participantEmails } })
            .project({ name: 1, email: 1, avatar: 1 })
            .toArray();

        return NextResponse.json({
            status: "success",
            participants: users,
        });
    } catch (error) {
        console.error("Participants Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch participants" },
            { status: 500 }
        );
    }
}

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
    const messages = await db
      .collection("deal_messages")
      .find({ dealId: params.id })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({ status: "success", data: messages });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDatabase();
    const { message, attachments, task } = await req.json();

    const record = {
      dealId: params.id,
      senderEmail: session.user.email,
      message,
      attachments: attachments || [],
      task: task || null,
      createdAt: new Date(),
    };

    await db.collection("deal_messages").insertOne(record);

    // trigger realtime update (via Pusher/Firebase)
    // e.g., pusher.trigger(`deal-${params.id}`, "new-message", record);

    return NextResponse.json({ status: "success", data: record });
  } catch (error) {
    console.error("Message POST Error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

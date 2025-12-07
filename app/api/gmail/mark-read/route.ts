import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { emailId } = await req.json();
    if (!emailId)
      return NextResponse.json({ error: "Missing emailId" }, { status: 400 });

    const db = await getDatabase();
    await db
      .collection("gmail_emails")
      .updateOne({ gmailId: emailId }, { $set: { isRead: true } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mark-read error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

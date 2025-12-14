import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const founderEmail = session.user.email;
  const investorEmail = params.investorEmail;
  const db = await getDatabase();

  const messages = await db
    .collection("deal_messages")
    .find({
      $or: [
        { senderEmail: investorEmail, receiverEmail: founderEmail },
        { senderEmail: founderEmail, receiverEmail: investorEmail },
      ],
    })
    .sort({ createdAt: 1 })
    .toArray();

  return NextResponse.json({
    status: "success",
    data: messages,
  });
}

import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDatabase();
  const founderEmail = session.user.email;

  const messages = await db
    .collection("deal_messages")
    .find({ receiverEmail: founderEmail })
    .sort({ createdAt: -1 })
    .toArray();

  const chatMap = {};

  messages.forEach((m) => {
    if (!chatMap[m.senderEmail]) {
      chatMap[m.senderEmail] = {
        investorEmail: m.senderEmail,
        dealId: m.dealId,
        lastMessage: m.message,
        lastAt: m.createdAt,
      };
    }
  });

  const investors = await db
    .collection("users")
    .find({ email: { $in: Object.keys(chatMap) } })
    .project({ name: 1, email: 1, image: 1 })
    .toArray();

  const chats = investors.map((inv) => ({
    ...inv,
    dealId: chatMap[inv.email].dealId,
    lastMessage: chatMap[inv.email].lastMessage,
    lastAt: chatMap[inv.email].lastAt,
  }));

  return NextResponse.json({ status: "success", data: chats });
}

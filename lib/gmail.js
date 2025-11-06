// lib/gmail.js
import { getServerSession } from "next-auth/next";
import { getDatabase } from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getAllEmails() {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
        throw new Error("Not authenticated");
    }

    const db = await getDatabase();
    const emailsCollection = db.collection("gmail_emails");

    // fetch all emails already saved in MongoDB
    const emails = await emailsCollection
        .find({}, { projection: { _id: 0 } })
        .toArray();

    return emails;
}

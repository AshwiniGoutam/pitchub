// app/api/gmail/[id]/route.js
import { NextResponse } from "next/server";
import { getAllEmails } from "@/lib/gmail";

export async function GET(req, { params }) {
    const { id } = params;

    try {
        const emails = await getAllEmails();
        const email = emails.find((e) => e.gmailId === id || e.id === id);

        if (!email) {
            return NextResponse.json({ error: "Email not found" }, { status: 404 });
        }

        return NextResponse.json(email);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch email" },
            { status: 500 }
        );
    }
}

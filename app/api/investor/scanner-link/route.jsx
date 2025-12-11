import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions); // <-- pass authOptions

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000/";

        return NextResponse.json({
            link: `${baseUrl}form/${session.user.id}`,
        });
    } catch (err) {
        console.error("Error generating scanner link:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

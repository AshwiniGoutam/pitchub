import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    // Note: In a real app, you'd filter by the authenticated investor's ID
    const userId = "temp-investor-id" // This should come from session

    const integrations = await db.collection("emailIntegrations").find({ userId }).toArray()

    // Add mock data for demonstration
    const mockIntegrations = [
      {
        _id: "gmail-integration",
        provider: "gmail",
        isActive: true,
        lastSync: new Date().toISOString(),
        emailsProcessed: 45,
      },
    ]

    return NextResponse.json(integrations.length > 0 ? integrations : mockIntegrations)
  } catch (error) {
    console.error("Error fetching email integrations:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()

    if (!provider || !["gmail", "outlook"].includes(provider)) {
      return NextResponse.json({ message: "Invalid provider" }, { status: 400 })
    }

    const db = await getDatabase()

    // Note: In a real implementation, this would:
    // 1. Redirect to OAuth flow for the provider
    // 2. Handle the OAuth callback
    // 3. Store the access/refresh tokens securely
    // 4. Set up webhook subscriptions for real-time email processing

    // For demo purposes, we'll create a mock integration
    const integration = {
      userId: "temp-investor-id", // This should come from session
      provider,
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      isActive: true,
      lastSync: new Date(),
      createdAt: new Date(),
    }

    const result = await db.collection("emailIntegrations").insertOne(integration)

    return NextResponse.json({
      message: `${provider} connected successfully`,
      integrationId: result.insertedId,
    })
  } catch (error) {
    console.error("Error connecting email:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

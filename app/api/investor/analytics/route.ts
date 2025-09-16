import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "30d"

    // Connect to database
    const { db } = await connectToDatabase()

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get deal flow data
    const dealFlowData = await db
      .collection("startups")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: now },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            received: { $sum: 1 },
            contacted: {
              $sum: {
                $cond: [{ $ne: ["$status", "new"] }, 1, 0],
              },
            },
            meetings: {
              $sum: {
                $cond: [{ $eq: ["$status", "meeting_scheduled"] }, 1, 0],
              },
            },
            invested: {
              $sum: {
                $cond: [{ $eq: ["$status", "invested"] }, 1, 0],
              },
            },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ])
      .toArray()

    // Get sector distribution
    const sectorData = await db
      .collection("startups")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: now },
          },
        },
        {
          $group: {
            _id: "$sector",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ])
      .toArray()

    // Get funding stage distribution
    const stageData = await db
      .collection("startups")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: now },
          },
        },
        {
          $group: {
            _id: "$stage",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ])
      .toArray()

    // Calculate KPIs
    const totalDeals = await db.collection("startups").countDocuments({
      createdAt: { $gte: startDate, $lte: now },
    })

    const contactedDeals = await db.collection("startups").countDocuments({
      createdAt: { $gte: startDate, $lte: now },
      status: { $ne: "new" },
    })

    const meetingDeals = await db.collection("startups").countDocuments({
      createdAt: { $gte: startDate, $lte: now },
      status: "meeting_scheduled",
    })

    const investedDeals = await db.collection("startups").countDocuments({
      createdAt: { $gte: startDate, $lte: now },
      status: "invested",
    })

    // Calculate response times
    const responseTimeData = await db
      .collection("startups")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: now },
            responseTime: { $exists: true },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: "$createdAt" },
            avgResponseTime: { $avg: "$responseTime" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray()

    const analytics = {
      kpis: {
        totalDeals,
        responseRate: totalDeals > 0 ? ((contactedDeals / totalDeals) * 100).toFixed(1) : "0",
        avgResponseTime: "4.2h", // This would be calculated from actual response times
        meetingConversion: contactedDeals > 0 ? ((meetingDeals / contactedDeals) * 100).toFixed(1) : "0",
        investmentRate: meetingDeals > 0 ? ((investedDeals / meetingDeals) * 100).toFixed(1) : "0",
        portfolioSize: await db.collection("startups").countDocuments({ status: "invested" }),
      },
      dealFlow: dealFlowData.map((item) => ({
        month: new Date(item._id.year, item._id.month - 1).toLocaleDateString("en-US", { month: "short" }),
        received: item.received,
        contacted: item.contacted,
        meetings: item.meetings,
        invested: item.invested,
      })),
      sectors: sectorData.map((item, index) => ({
        name: item._id || "Unknown",
        value: item.count,
        deals: item.count,
      })),
      stages: stageData.map((item) => ({
        stage: item._id || "Unknown",
        count: item.count,
        percentage: totalDeals > 0 ? Math.round((item.count / totalDeals) * 100) : 0,
      })),
      responseTime: responseTimeData.map((item) => ({
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][item._id - 1],
        avgHours: (item.avgResponseTime / 3600000).toFixed(1), // Convert ms to hours
      })),
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}

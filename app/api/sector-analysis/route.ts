// app/api/sector-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  status: string;
  attachments: any[];
}

interface SectorResult {
  emailId: string;
  sector: string;
}

// Fetch emails from Gmail API
const fetchEmails = async (): Promise<Email[]> => {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/gmail?limit=100`);
  if (!res.ok) throw new Error("Failed to fetch emails");
  const data = await res.json();
  return data.emails || [];
};

// Predict sectors for emails
const predictSectors = async (emails: Email[]): Promise<{ sectors: SectorResult[] }> => {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/predict-sectors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ emails }),
  });
  if (!res.ok) throw new Error("Failed to predict sectors");
  return res.json();
};

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API: Fetching sector data...");
    
    // Step 1: Fetch emails
    const emails = await fetchEmails();
    console.log(`📧 API: Found ${emails.length} emails`);
    
    if (emails.length === 0) {
      return NextResponse.json({ 
        sectors: [], 
        totalEmails: 0, 
        analyzedEmails: 0 
      });
    }

    // Step 2: Predict sectors
    const sectorsResponse = await predictSectors(emails);
    console.log("🎯 API: Sector predictions completed");

    // Step 3: Calculate sector distribution
    const sectorCounts: Record<string, number> = {};
    let totalAnalyzed = 0;

    sectorsResponse.sectors?.forEach(prediction => {
      const sector = prediction.sector || 'Unknown';
      if (sector && sector !== 'Other' && sector !== 'Unknown') {
        sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
        totalAnalyzed++;
      }
    });

    // Convert to chart data format with percentages
    const sectorData = Object.entries(sectorCounts).map(([name, value]) => ({
      name: name,
      value: value,
      percentage: totalAnalyzed > 0 ? Math.round((value / totalAnalyzed) * 100) : 0
    })).sort((a, b) => b.value - a.value);

    console.log("📊 API: Final sector data processed");

    return NextResponse.json({
      sectors: sectorData,
      totalEmails: emails.length,
      analyzedEmails: totalAnalyzed
    });

  } catch (error) {
    console.error("API Error in sector analysis:", error);
    return NextResponse.json(
      { 
        error: "Failed to analyze sectors",
        sectors: [],
        totalEmails: 0,
        analyzedEmails: 0
      },
      { status: 500 }
    );
  }
}
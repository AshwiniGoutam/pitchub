"use server";

import { cookies, headers } from 'next/headers';

interface DashboardStats {
  totalPitches: number;
  newThisWeek: number;
  underReview: number;
  contacted: number;
}

interface Startup {
  _id: string;
  name: string;
  sector: string;
  stage: string;
  location: string;
  fundingRequirement: {
    min: number;
    max: number;
  };
  relevanceScore: number;
  status: string;
  createdAt: string;
  description: string;
}

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
  startup?: any;
}

interface SectorResult {
  emailId: string;
  sector: string;
}

// Helper function to get the base URL
const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  const headersList = headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
};

// Fetch emails from your Gmail API with proper auth
const fetchEmails = async (): Promise<Email[]> => {
  const baseUrl = getBaseUrl();
  const cookieStore = cookies();
  const authCookie = cookieStore.toString();
  
  const res = await fetch(`${baseUrl}/api/gmail?limit=100`, {
    headers: {
      Cookie: authCookie,
    },
    cache: 'no-store'
  });
  
  if (!res.ok) {
    console.error(`Failed to fetch emails: ${res.status} ${res.statusText}`);
    return [];
  }
  
  const data = await res.json();
  return data.emails || [];
};

// Predict sectors for emails
// Predict sectors for emails - ULTRA FAST version
const predictSectors = async (emails: Email[]): Promise<{ sectors: SectorResult[] }> => {
  const baseUrl = getBaseUrl();
  const cookieStore = cookies();
  const authCookie = cookieStore.toString();

  console.log(`🚀 Sending ${emails.length} emails for fast keyword-based sector analysis...`);
  
  const res = await fetch(`${baseUrl}/api/predict-sectors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify({ emails }),
    cache: 'no-store'
  });
  
  if (!res.ok) {
    console.error(`Failed to predict sectors: ${res.status} ${res.statusText}`);
    return { sectors: [] };
  }
  
  const result = await res.json();
  console.log(`✅ Sector analysis completed: ${result.stats?.categorized} categorized`);
  return result;
};

// Fetch dashboard stats
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const baseUrl = getBaseUrl();
  const cookieStore = cookies();
  const authCookie = cookieStore.toString();

  const res = await fetch(`${baseUrl}/api/investor/stats`, {
    headers: {
      Cookie: authCookie,
    },
    cache: 'no-store'
  });
  
  if (!res.ok) {
    console.error(`Failed to fetch stats: ${res.status} ${res.statusText}`);
    return {
      totalPitches: 0,
      newThisWeek: 0,
      underReview: 0,
      contacted: 0
    };
  }
  
  return res.json();
};

// Fetch startups
export const fetchStartups = async (): Promise<Startup[]> => {
  const baseUrl = getBaseUrl();
  const cookieStore = cookies();
  const authCookie = cookieStore.toString();

  const res = await fetch(`${baseUrl}/api/investor/startups`, {
    headers: {
      Cookie: authCookie,
    },
    cache: 'no-store'
  });
  
  if (!res.ok) {
    console.error(`Failed to fetch startups: ${res.status} ${res.statusText}`);
    return [];
  }
  
  return res.json();
};

// Mock sector data for fallback
const mockSectorData = {
  sectors: [
    { name: "Technology", value: 45, percentage: 45 },
    { name: "Healthcare", value: 25, percentage: 25 },
    { name: "Finance", value: 15, percentage: 15 },
    { name: "E-commerce", value: 10, percentage: 10 },
    { name: "Education", value: 5, percentage: 5 }
  ],
  totalEmails: 100,
  analyzedEmails: 100
};

// Main sector data fetcher with fallback
export const fetchSectorData = async () => {
  console.log("🔍 [SERVER] Fetching sector data...");
  
  try {
    // Step 1: Fetch emails
    const emails = await fetchEmails();
    console.log(`📧 [SERVER] Found ${emails.length} emails`);
    
    if (emails.length === 0) {
      console.log("📊 [SERVER] Using mock data - no emails found");
      return mockSectorData;
    }

    // Step 2: Predict sectors
    const sectorsResponse = await predictSectors(emails);
    console.log("🎯 [SERVER] Sector predictions completed");

    // If no sectors returned, use mock data
    if (!sectorsResponse.sectors || sectorsResponse.sectors.length === 0) {
      console.log("📊 [SERVER] Using mock data - no sectors analyzed");
      return mockSectorData;
    }

    // Step 3: Calculate sector distribution
    const sectorCounts = {};
    let totalAnalyzed = 0;

    sectorsResponse.sectors?.forEach(prediction => {
      const sector = prediction.sector || 'Unknown';
      if (sector && sector !== 'Other' && sector !== 'Unknown') {
        sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
        totalAnalyzed++;
      }
    });

    // If no valid sectors found, use mock data
    if (totalAnalyzed === 0) {
      console.log("📊 [SERVER] Using mock data - no valid sectors found");
      return mockSectorData;
    }

    // Convert to chart data format with percentages
    const sectorData = Object.entries(sectorCounts).map(([name, value]) => ({
      name: name,
      value: value,
      percentage: totalAnalyzed > 0 ? Math.round((value / totalAnalyzed) * 100) : 0
    })).sort((a, b) => b.value - a.value);

    console.log("📊 [SERVER] Final sector data processed");
    return {
      sectors: sectorData,
      totalEmails: emails.length,
      analyzedEmails: totalAnalyzed
    };
  } catch (error) {
    console.error("❌ [SERVER] Error fetching sector data, using mock data:", error);
    return mockSectorData;
  }
};
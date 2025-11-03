// "use client";

// import { Bell, Calendar } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { InvestorSidebar } from "@/components/investor-sidebar";
// import { useEffect, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// interface DashboardStats {
//   totalPitches: number;
//   newThisWeek: number;
//   underReview: number;
//   contacted: number;
// }

// interface Startup {
//   _id: string;
//   name: string;
//   sector: string;
//   stage: string;
//   location: string;
//   fundingRequirement: {
//     min: number;
//     max: number;
//   };
//   relevanceScore: number;
//   status: string;
//   createdAt: string;
//   description: string;
// }

// interface Email {
//   id: string;
//   from: string;
//   fromEmail: string;
//   subject: string;
//   content: string;
//   timestamp: string;
//   isRead: boolean;
//   isStarred: boolean;
//   status: string;
//   attachments: any[];
//   startup?: any;
// }

// interface SectorResult {
//   emailId: string;
//   sector: string;
// }

// // Color palette for sectors
// const COLORS = ["#10B981", "#3B82F6", "#EAB308", "#EF4444", "#8B5CF6", "#F59E0B", "#EC4899"];

// // Fetch emails from your Gmail API
// const fetchEmails = async (): Promise<Email[]> => {
//   const res = await fetch("/api/gmail?limit=100");
//   if (!res.ok) throw new Error("Failed to fetch emails");
//   const data = await res.json();
//   return data.emails || [];
// };

// // Predict sectors for emails
// const predictSectors = async (emails: Email[]): Promise<{ sectors: SectorResult[] }> => {
//   const res = await fetch("/api/predict-sectors", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ emails }),
//   });
//   if (!res.ok) throw new Error("Failed to predict sectors");
//   return res.json();
// };

// // Fetch dashboard stats
// const fetchDashboardStats = async (): Promise<DashboardStats> => {
//   const res = await fetch("/api/investor/stats");
//   if (!res.ok) throw new Error("Failed to fetch stats");
//   return res.json();
// };

// // Fetch startups
// const fetchStartups = async (): Promise<Startup[]> => {
//   const res = await fetch("/api/investor/startups");
//   if (!res.ok) throw new Error("Failed to fetch startups");
//   return res.json();
// };

// // Main sector data fetcher
// const fetchSectorData = async () => {
//   console.log("🔍 Fetching sector data...");
  
//   // Step 1: Fetch emails
//   const emails = await fetchEmails();
//   console.log(`📧 Found ${emails.length} emails`);
  
//   if (emails.length === 0) {
//     return { sectors: [], totalEmails: 0 };
//   }

//   // Step 2: Predict sectors
//   const sectorsResponse = await predictSectors(emails);
//   console.log("🎯 Sector predictions:", sectorsResponse);

//   // Step 3: Calculate sector distribution
//   const sectorCounts = {};
//   let totalAnalyzed = 0;

//   sectorsResponse.sectors?.forEach(prediction => {
//     const sector = prediction.sector || 'Unknown';
//     if (sector && sector !== 'Other' && sector !== 'Unknown') {
//       sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
//       totalAnalyzed++;
//     }
//   });

//   // Convert to chart data format with percentages
//   const sectorData = Object.entries(sectorCounts).map(([name, value]) => ({
//     name: name,
//     value: value,
//     percentage: totalAnalyzed > 0 ? Math.round((value / totalAnalyzed) * 100) : 0
//   })).sort((a, b) => b.value - a.value);

//   console.log("📊 Final sector data:", sectorData);
//   return {
//     sectors: sectorData,
//     totalEmails: emails.length,
//     analyzedEmails: totalAnalyzed
//   };
// };

// export default function DashboardPage() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sectorFilter, setSectorFilter] = useState("all");
//   const [stageFilter, setStageFilter] = useState("all");
//   const [filteredStartups, setFilteredStartups] = useState<Startup[]>([]);

//   // Use React Query for all data fetching with caching
//   const { data: stats, isLoading: statsLoading } = useQuery({
//     queryKey: ['dashboard-stats'],
//     queryFn: fetchDashboardStats,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });

//   const { data: startups, isLoading: startupsLoading } = useQuery({
//     queryKey: ['startups'],
//     queryFn: fetchStartups,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });

//   const { 
//     data: sectorData, 
//     isLoading: sectorLoading, 
//     error: sectorError,
//     refetch: refetchSectors 
//   } = useQuery({
//     queryKey: ['sector-data'],
//     queryFn: fetchSectorData,
//     staleTime: 10 * 60 * 1000, // 10 minutes
//     gcTime: 15 * 60 * 1000, // 15 minutes cache
//     retry: 2,
//   });

//   useEffect(() => {
//     if (startups) {
//       let filtered = startups;

//       if (searchTerm) {
//         filtered = filtered.filter(
//           (startup) =>
//             startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             startup.description.toLowerCase().includes(searchTerm.toLowerCase())
//         );
//       }

//       if (sectorFilter !== "all") {
//         filtered = filtered.filter((startup) => startup.sector === sectorFilter);
//       }

//       if (stageFilter !== "all") {
//         filtered = filtered.filter((startup) => startup.stage === stageFilter);
//       }

//       setFilteredStartups(filtered);
//     }
//   }, [startups, searchTerm, sectorFilter, stageFilter]);

//   // Custom tooltip
//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="bg-white p-3 border rounded-lg shadow-lg">
//           <p className="font-bold">{data.name}</p>
//           <p className="text-sm">{data.value} emails ({data.percentage}%)</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   // Custom label for pie chart
//   const renderCustomizedLabel = ({
//     cx, cy, midAngle, innerRadius, outerRadius, percent
//   }) => {
//     if (percent < 0.05) return null;
    
//     const RADIAN = Math.PI / 180;
//     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);

//     return (
//       <text 
//         x={x} 
//         y={y} 
//         fill="white" 
//         textAnchor={x > cx ? 'start' : 'end'} 
//         dominantBaseline="central"
//         fontSize={11}
//         fontWeight="bold"
//       >
//         {`${(percent * 100).toFixed(0)}%`}
//       </text>
//     );
//   };

//   const isLoading = statsLoading || startupsLoading || sectorLoading;

//   if (isLoading) {
//     return (
//       <div className="flex h-screen">
//         <InvestorSidebar />
//         <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
//             <p className="text-muted-foreground text-lg">
//               {sectorLoading ? "Analyzing email sectors..." : "Loading your dashboard..."}
//             </p>
//             {sectorLoading && (
//               <p className="text-sm text-gray-500 mt-2">
//                 Analyzing your emails to build sector distribution...
//               </p>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (sectorError) {
//     return (
//       <div className="flex h-screen">
//         <InvestorSidebar />
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <p className="text-red-600 text-lg mb-4">Error loading sector data</p>
//             <Button onClick={() => refetchSectors()} className="mt-4">
//               Retry Analysis
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <InvestorSidebar />

//       <div className="flex-1 overflow-auto">
//         {/* Header */}
//         <header className="sticky top-0 z-10 border-b bg-white">
//           <div className="flex h-16 items-center justify-between px-8">
//             <h1 className="text-2xl font-bold">Dashboard</h1>
//             <div className="flex items-center gap-4">
//               <Button variant="outline" className="gap-2 bg-transparent">
//                 <Calendar className="h-4 w-4" />
//                 Date Range
//               </Button>
//               <Button variant="ghost" size="icon">
//                 <Bell className="h-5 w-5" />
//               </Button>
//               <Button 
//                 variant="outline" 
//                 size="sm"
//                 onClick={() => refetchSectors()}
//                 disabled={sectorLoading}
//               >
//                 {sectorLoading ? "Refreshing..." : "Refresh Data"}
//               </Button>
//             </div>
//           </div>
//         </header>

//         {/* Main Content */}
//         <main className="p-8">
//           <div className="grid gap-6 lg:grid-cols-12">
//             {/* Summary - col-span-3 */}
//             <Card className="lg:col-span-5">
//               <CardHeader>
//                 <CardTitle>Summary</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div>
//                   <p className="text-sm text-gray-500">Total Pitches</p>
//                   <p className="text-4xl font-bold">{stats?.totalPitches || 0}</p>
//                 </div>

//                 <div>
//                   <div className="mb-2 flex items-center justify-between">
//                     <p className="text-sm text-gray-500">Quality Deal Flow</p>
//                     <Badge
//                       variant="secondary"
//                       className="bg-emerald-50 text-emerald-700"
//                     >
//                       +5% ↑
//                     </Badge>
//                   </div>
//                   <p className="text-4xl font-bold">76</p>
//                   <div className="mt-4 h-16">
//                     <svg viewBox="0 0 200 50" className="w-full">
//                       <path
//                         d="M 0,25 Q 50,15 100,20 T 200,25"
//                         fill="none"
//                         stroke="rgb(16 185 129)"
//                         strokeWidth="2"
//                       />
//                     </svg>
//                   </div>
//                 </div>

//                 <div>
//                   <p className="text-sm text-gray-500">Reviewed</p>
//                   <p className="text-4xl font-bold">{stats?.underReview || 0}</p>
//                 </div>

//                 <div>
//                   <p className="text-sm text-gray-500">Contacted</p>
//                   <p className="text-4xl font-bold">{stats?.contacted || 0}</p>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Deal Flow by Sector - col-span-9 */}
//             <Card className="lg:col-span-7 w-full">
//               <CardHeader>
//                 <CardTitle>
//                   Deal Flow by Sector
//                   {sectorData?.sectors && sectorData.sectors.length > 0 && (
//                     <span className="text-sm font-normal text-gray-500 ml-2">
//                       ({sectorData.analyzedEmails} emails analyzed)
//                     </span>
//                   )}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="h-100">
//                   {sectorData?.sectors && sectorData.sectors.length > 0 ? (
//                     <ResponsiveContainer width="100%" height={400}>
//                       <PieChart>
//                         <Pie
//                           data={sectorData.sectors}
//                           cx="50%"
//                           cy="50%"
//                           outerRadius={140}
//                           innerRadius={70}
//                           dataKey="value"
//                           nameKey="name"
//                           label={renderCustomizedLabel}
//                           labelLine={false}
//                         >
//                           {sectorData.sectors.map((entry, index) => (
//                             <Cell 
//                               key={`cell-${index}`} 
//                               fill={COLORS[index % COLORS.length]} 
//                             />
//                           ))}
//                         </Pie>
//                         <Tooltip content={<CustomTooltip />} />
//                         <Legend 
//                           formatter={(value, entry, index) => (
//                             <span style={{ color: entry.color, fontSize: '12px' }}>
//                               {sectorData.sectors[index]?.name} ({sectorData.sectors[index]?.value})
//                             </span>
//                           )}
//                         />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <div className="flex flex-col items-center justify-center h-64 text-gray-500">
//                       <div className="text-lg mb-2">No Email Data</div>
//                       <div className="text-sm text-center mb-4">
//                         {sectorData?.totalEmails > 0 
//                           ? `Found ${sectorData.totalEmails} emails but couldn't analyze sectors`
//                           : "No pitch emails found in your inbox"
//                         }
//                       </div>
//                       <Button onClick={() => refetchSectors()} variant="outline">
//                         Retry Analysis
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* What's New Today */}
//           <div className="my-8">
//             <h2 className="mb-4 text-xl font-bold text-gray-900">
//               What's New Today
//             </h2>
//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//               <Card>
//                 <CardContent className="flex items-center gap-4 p-4">
//                   <Avatar className="h-12 w-12">
//                     <AvatarFallback className="bg-gray-200">IT</AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <p className="font-semibold text-gray-900">InnovateTech</p>
//                     <p className="text-sm text-gray-500">New pitch</p>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="flex items-center gap-4 p-4">
//                   <Avatar className="h-12 w-12">
//                     <AvatarFallback className="bg-gray-200">QL</AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <p className="font-semibold text-gray-900">QuantumLeap</p>
//                     <p className="text-sm text-gray-500">Founder replied</p>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="flex items-center gap-4 p-4">
//                   <Avatar className="h-12 w-12">
//                     <AvatarFallback className="bg-gray-200">ES</AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <p className="font-semibold text-gray-900">EcoSolutions</p>
//                     <p className="text-sm text-gray-500">Follow-up</p>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="flex items-center gap-4 p-4">
//                   <Avatar className="h-12 w-12">
//                     <AvatarImage src="/placeholder.svg?height=48&width=48" />
//                     <AvatarFallback>DS</AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <p className="font-semibold text-gray-900">DataSphere</p>
//                     <p className="text-sm text-gray-500">New pitch</p>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }




import DashboardClient from "./DashboardClient";
import { fetchDashboardStats, fetchStartups, fetchSectorData } from "./actions";
import { cookies } from 'next/headers';

// Function to fetch latest emails for "What's New Today"
const fetchLatestEmails = async (): Promise<any[]> => {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const cookieStore = cookies();
    const authCookie = cookieStore.toString();
    
    const res = await fetch(`${baseUrl}/api/gmail?limit=4&sort=newest`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie,
      },
    });
    
    if (!res.ok) {
      console.error(`❌ Failed to fetch latest emails: ${res.status} ${res.statusText}`);
      return [];
    }
    
    const data = await res.json();
    console.log(`✅ Successfully fetched ${data.emails?.length || 0} latest emails`);
    return data.emails || [];
  } catch (error) {
    console.error('❌ Error fetching latest emails:', error);
    return [];
  }
};

// NEW: Function to fetch ALL emails for quality deal flow calculation
const fetchAllEmails = async (): Promise<any[]> => {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const cookieStore = cookies();
    const authCookie = cookieStore.toString();
    
    console.log('🔍 Fetching ALL emails for quality deal flow calculation...');
    
    const res = await fetch(`${baseUrl}/api/gmail?limit=10&sort=newest`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie,
      },
    });
    
    if (!res.ok) {
      console.error(`❌ Failed to fetch all emails: ${res.status} ${res.statusText}`);
      return [];
    }
    
    const data = await res.json();
    console.log(`✅ Successfully fetched ${data.emails?.length || 0} total emails for quality calculation`);
    return data.emails || [];
  } catch (error) {
    console.error('❌ Error fetching all emails:', error);
    return [];
  }
};

// Function to fetch investor thesis
const fetchInvestorThesis = async (): Promise<any> => {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const cookieStore = cookies();
    const authCookie = cookieStore.toString();
    
    const res = await fetch(`${baseUrl}/api/investor/thesis`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie,
      },
    });
    
    if (!res.ok) {
      console.error(`❌ Failed to fetch investor thesis: ${res.status} ${res.statusText}`);
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error('❌ Error fetching investor thesis:', error);
    return null;
  }
};

export default async function DashboardPage() {
  try {
    console.log('🚀 Starting dashboard data fetch...');
    
    // Fetch all data on the server in parallel
    const [stats, startups, sectorData, latestEmails, allEmails, thesisData] = await Promise.all([
      fetchDashboardStats(),
      fetchStartups(),
      fetchSectorData(),
      fetchLatestEmails(),
      fetchAllEmails(), // NEW: Fetch all emails for quality calculation
      fetchInvestorThesis(),
    ]);

    console.log(`📊 Dashboard loaded successfully:`);
    console.log(`   - Stats: ${stats.totalPitches} total pitches`);
    console.log(`   - Startups: ${startups.length} startups`);
    console.log(`   - Sector Data: ${sectorData.sectors.length} sectors`);
    console.log(`   - Latest Emails: ${latestEmails.length} emails (for What's New)`);
    console.log(`   - All Emails: ${allEmails.length} emails (for Quality Deal Flow)`);
    console.log(`   - Thesis Data: ${thesisData ? 'loaded' : 'not available'}`);

    return (
      <DashboardClient
        initialStats={stats}
        initialStartups={startups}
        initialSectorData={sectorData}
        initialLatestEmails={latestEmails}
        initialAllEmails={allEmails} // NEW: Pass all emails
        initialThesis={thesisData}
      />
    );
  } catch (error) {
    console.error("❌ Error in dashboard page:", error);
    
    // Fallback data in case of complete failure
    const fallbackStats = {
      totalPitches: 0,
      newThisWeek: 0,
      underReview: 0,
      contacted: 0
    };
    
    const fallbackStartups = [];
    
    const fallbackSectorData = {
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

    const fallbackLatestEmails = [];
    const fallbackAllEmails = [];
    const fallbackThesis = null;

    console.log('🔄 Using fallback data for dashboard');

    return (
      <DashboardClient
        initialStats={fallbackStats}
        initialStartups={fallbackStartups}
        initialSectorData={fallbackSectorData}
        initialLatestEmails={fallbackLatestEmails}
        initialAllEmails={fallbackAllEmails}
        initialThesis={fallbackThesis}
      />
    );
  }
}
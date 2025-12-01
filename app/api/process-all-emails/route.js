// import { summarizeEmail } from "../../../lib/gemini";
// import { getDatabase } from "@/lib/mongodb";

// export async function POST(request) {
//   try {
//     const { emails, action, note, meetingDetails, requestData, userEmail } = await request.json();

//     if (!emails || !Array.isArray(emails)) {
//       return Response.json({ error: "Emails array is required" }, { status: 400 });
//     }

//     if (!userEmail) {
//       return Response.json({ error: "userEmail is required" }, { status: 400 });
//     }

//     const db = await getDatabase();
//     const collection = db.collection("emailAnalyses");
//     const analysisResults = [];

//     for (const email of emails) {
//       try {
//         const existing = await collection.findOne({ emailId: email.id, userEmail });

//         const analysis =
//           existing?.analysis && Object.keys(existing.analysis).length > 0
//             ? existing.analysis
//             : await summarizeEmail(email.content);

//         const record = {
//           ...existing,
//           userEmail,
//           emailId: email.id,
//           analysis,
//           action: action || existing?.action || "none",
//           note: note ?? existing?.note ?? "",
//           meetingDetails: meetingDetails ?? existing?.meetingDetails ?? null,
//           requestData: requestData ?? existing?.requestData ?? null,
//           updatedAt: new Date(),
//           createdAt: existing?.createdAt || new Date(),
//         };

//         await collection.updateOne(
//           { emailId: email.id, userEmail },
//           { $set: record },
//           { upsert: true }
//         );

//         analysisResults.push(record);
//       } catch (error) {
//         console.error(`Error analyzing email ${email.id}:`, error);
//         analysisResults.push({
//           userEmail,
//           emailId: email.id,
//           analysis: { summary: "Analysis failed", sector: "Unknown" },
//           action: "failed",
//         });
//       }
//     }

//     return Response.json({
//       status: "completed",
//       message: "Analysis completed successfully",
//       analyses: analysisResults,
//     });
//   } catch (error) {
//     console.error("API Error:", error);
//     return Response.json(
//       { error: "Failed to process emails", details: error.message },
//       { status: 500 }
//     );
//   }
// }


import { summarizeEmail } from "../../../lib/gemini";
import { getDatabase } from "@/lib/mongodb";

export async function POST(request) {
  try {
    const { emails, action, note, meetingDetails, requestData, userEmail } = await request.json();

    if (!emails || !Array.isArray(emails)) {
      return Response.json({ error: "Emails array is required" }, { status: 400 });
    }

    if (!userEmail) {
      return Response.json({ error: "userEmail is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection("emailAnalyses");

    const concurrency = 5; // Max parallel Gemini calls
    const results = [];
    const bulkOps = [];

    const processEmail = async (email) => {
      try {
        const existing = await collection.findOne({ emailId: email.id, userEmail });

        const analysis =
          existing?.analysis && Object.keys(existing.analysis).length > 0
            ? existing.analysis
            : await summarizeEmail(email.content);

        const record = {
          ...existing,
          userEmail,
          emailId: email.id,
          analysis,
          action: action || existing?.action || "none",
          note: note ?? existing?.note ?? "",
          meetingDetails: meetingDetails ?? existing?.meetingDetails ?? null,
          requestData: requestData ?? existing?.requestData ?? null,
          updatedAt: new Date(),
          createdAt: existing?.createdAt || new Date(),
        };

        // Add to bulk operations
        bulkOps.push({
          updateOne: {
            filter: { emailId: email.id, userEmail },
            update: { $set: record },
            upsert: true,
          },
        });

        return record;
      } catch (err) {
        console.error(`Error analyzing email ${email.id}:`, err);
        return {
          userEmail,
          emailId: email.id,
          analysis: { summary: "Analysis failed", sector: "Unknown" },
          action: "failed",
        };
      }
    };

    // 🔹 Process emails with concurrency pool
    const pool = [];
    for (const email of emails) {
      pool.push(processEmail(email));

      if (pool.length >= concurrency) {
        const res = await Promise.all(pool);
        results.push(...res);
        pool.length = 0; // reset pool
      }
    }

    // Remaining emails
    if (pool.length > 0) {
      const res = await Promise.all(pool);
      results.push(...res);
    }

    // 🔹 Bulk write to DB (much faster than multiple updateOne calls)
    if (bulkOps.length > 0) {
      await collection.bulkWrite(bulkOps, { ordered: false });
    }

    return Response.json({
      status: "completed",
      message: "Analysis completed successfully",
      analyses: results,
    });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { error: "Failed to process emails", details: error.message },
      { status: 500 }
    );
  }
}

import { summarizeEmail } from "../../../../lib/gemini";
import { getDatabase } from "@/lib/mongodb";
import { google } from "googleapis";

export async function POST(request) {
  try {
    const {
      emails,
      action,
      note,
      meetingDetails,
      requestData,
      userEmail,
      accessToken,
    } = await request.json();

    if (!emails || !Array.isArray(emails)) {
      return Response.json({ error: "Emails array is required" }, { status: 400 });
    }

    if (!userEmail) {
      return Response.json({ error: "userEmail is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection("emailAnalyses");
    const analysisResults = [];

    let calendar = null;
    if (action === "schedule_meeting" && accessToken) {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });
      calendar = google.calendar({ version: "v3", auth: oauth2Client });
    }

    for (const email of emails) {
      try {
        const existing = await collection.findOne({ emailId: email.id, userEmail });

        const analysis =
          existing?.analysis && Object.keys(existing.analysis).length > 0
            ? existing.analysis
            : await summarizeEmail(email.content);

        let meetingInfo = meetingDetails ?? existing?.meetingDetails ?? null;

        // === Handle meeting creation ===
        if (action === "schedule_meeting" && calendar) {
          try {
            const startTime = meetingDetails?.startTime || new Date().toISOString();
            const endTime =
              meetingDetails?.endTime ||
              new Date(Date.now() + 30 * 60000).toISOString();

            const event = {
              summary: meetingDetails?.summary || "AI Scheduled Meeting",
              description:
                meetingDetails?.description ||
                "This meeting was automatically created via email analysis.",
              start: { dateTime: startTime },
              end: { dateTime: endTime },
              attendees:
                meetingDetails?.attendees?.map((e) => ({ email: e })) || [],
              conferenceData: {
                createRequest: {
                  requestId: `${email.id}-${Date.now()}`,
                  conferenceSolutionKey: { type: "hangoutsMeet" },
                },
              },
            };

            const response = await calendar.events.insert({
              calendarId: "primary",
              resource: event,
              conferenceDataVersion: 1,
              sendUpdates: "all",
            });

            const meetLink =
              response.data?.conferenceData?.entryPoints?.find(
                (e) => e.entryPointType === "video"
              )?.uri || response.data?.hangoutLink || null;

            meetingInfo = {
              meetLink,
              eventId: response.data.id,
              startTime,
              endTime,
              summary: event.summary,
              attendees: meetingDetails?.attendees || [],
            };

            console.log("✅ Google Meet created:", meetLink);
          } catch (err) {
            console.error("❌ Google Meet creation failed:", err.message);
          }
        }

        // === Handle note appending ===
        const newNoteText = typeof note === "object" ? note.note : note;

        // Build base update data
        const baseUpdate = {
          $set: {
            userEmail,
            emailId: email.id,
            analysis,
            action: action || existing?.action || "none",
            meetingDetails: meetingInfo,
            requestData: requestData ?? existing?.requestData ?? null,
            createdAt: existing?.createdAt || new Date(),
            updatedAt: new Date(),
          },
        };

        // If new note provided, append instead of overwrite
        if (newNoteText && newNoteText.trim() !== "") {
          baseUpdate.$push = {
            notes: {
              text: newNoteText.trim(),
              createdAt: new Date(),
            },
          };
        }

        await collection.updateOne(
          { emailId: email.id, userEmail },
          baseUpdate,
          { upsert: true }
        );

        const updatedDoc = await collection.findOne({ emailId: email.id, userEmail });
        analysisResults.push(updatedDoc);
      } catch (error) {
        console.error(`Error analyzing email ${email.id}:`, error);
        analysisResults.push({
          userEmail,
          emailId: email.id,
          analysis: { summary: "Analysis failed", sector: "Unknown" },
          action: "failed",
        });
      }
    }


    return Response.json({
      status: "completed",
      message:
        action === "schedule_meeting"
          ? "Meeting scheduled successfully"
          : "Analysis completed successfully",
      analyses: analysisResults,
    });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { error: "Failed to process emails", details: error.message },
      { status: 500 }
    );
  }
}

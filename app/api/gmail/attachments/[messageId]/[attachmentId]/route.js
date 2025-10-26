// File: /app/api/gmail/attachments/[messageId]/[attachmentId]/route.js
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { google } from "googleapis";
import { getServerSession } from "next-auth/next";

export async function GET(req, { params }) {
  const { messageId, attachmentId } = params;

  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return new Response(JSON.stringify({ error: "Not logged in" }), { status: 401 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Get attachment data
    const attachmentRes = await gmail.users.messages.attachments.get({
      userId: "me",
      messageId,
      id: attachmentId,
    });

    if (!attachmentRes.data.data) {
      throw new Error("No attachment data found");
    }

    // Get message details to find filename
    let filename = "attachment";
    let mimeType = attachmentRes.data.mimeType || "application/octet-stream";
    
    try {
      const messageRes = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      // Function to find attachment info in message parts
      const findAttachmentInfo = (parts) => {
        for (const part of parts || []) {
          if (part.body?.attachmentId === attachmentId) {
            return {
              filename: part.filename,
              mimeType: part.mimeType
            };
          }
          if (part.parts) {
            const found = findAttachmentInfo(part.parts);
            if (found) return found;
          }
        }
        return null;
      };

      const attachmentInfo = findAttachmentInfo(messageRes.data.payload?.parts);
      if (attachmentInfo) {
        filename = attachmentInfo.filename || filename;
        mimeType = attachmentInfo.mimeType || mimeType;
      }
    } catch (error) {
      console.warn("Could not fetch message details for filename:", error.message);
    }

    // Decode base64 data
    const buffer = Buffer.from(
      attachmentRes.data.data.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    );

    // Return optimized response with proper headers
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "X-Content-Type-Options": "nosniff",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error) {
    console.error("Attachment download error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to download attachment",
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
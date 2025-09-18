import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { google } from "googleapis";
import { getServerSession } from "next-auth/next";

export async function GET(req, { params }) {
  const { messageId, attachmentId } = params;

  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return new Response(JSON.stringify({ error: "Not logged in" }), { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const res = await gmail.users.messages.attachments.get({
    userId: "me",
    messageId,
    id: attachmentId,
  });

  const buffer = Buffer.from(res.data.data, "base64");
  const mimeType = res.data.mimeType || "application/octet-stream";

  return new Response(buffer, {
    headers: {
      "Content-Type": mimeType,
    },
  });
}

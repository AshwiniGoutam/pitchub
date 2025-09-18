import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

function decodeBase64(base64String) {
  const buff = Buffer.from(base64String.replace(/-/g, "+").replace(/_/g, "/"), "base64")
  return buff.toString("utf-8")
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 })
  }

  // 1. Fetch list of messages
  const listRes = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5",
    {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }
  )
  const listData = await listRes.json()

  if (!listData.messages) {
    return new Response(JSON.stringify([]), { status: 200 })
  }

  // 2. Fetch full details for each message
  const detailedMessages = await Promise.all(
    listData.messages.map(async (msg) => {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      )
      const detail = await detailRes.json()

      const headers = detail.payload?.headers || []
      const subject = headers.find(h => h.name === "Subject")?.value || "(no subject)"
      const from = headers.find(h => h.name === "From")?.value || "(unknown sender)"
      const date = headers.find(h => h.name === "date")?.value || ""

      // Extract body (try plain text or HTML)
      let body = ""
      if (detail.payload?.parts) {
        for (const part of detail.payload.parts) {
          if (part.mimeType === "text/html" || part.mimeType === "text/plain") {
            body = decodeBase64(part.body.data || "")
            break
          }
        }
      } else if (detail.payload?.body?.data) {
        body = decodeBase64(detail.payload.body.data)
      }

      // Extract attachments
      const attachments = []
      if (detail.payload?.parts) {
        for (const part of detail.payload.parts) {
          if (part.filename && part.body?.attachmentId) {
            const attachmentRes = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}/attachments/${part.body.attachmentId}`,
              {
                headers: { Authorization: `Bearer ${session.accessToken}` },
              }
            )
            const attachmentData = await attachmentRes.json()
            attachments.push({
              filename: part.filename,
              mimeType: part.mimeType,
              data: attachmentData.data, // Base64 string
            })
          }
        }
      }

      return {
        id: msg.id,
        subject,
        from,
        date,
        body,
        attachments,
      }
    })
  )

  return new Response(JSON.stringify(detailedMessages), { status: 200 })
}

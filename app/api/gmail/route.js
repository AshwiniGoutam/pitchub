import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

function decodeBase64(base64String) {
  if (!base64String) return ""
  const buff = Buffer.from(
    base64String.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  )
  return buff.toString("utf-8")
}

// Recursive function to extract email body
function extractBody(payload) {
  if (!payload) return ""

  // Case 1: Direct body
  if (payload.body?.data) {
    return decodeBase64(payload.body.data)
  }

  // Case 2: Multipart (check parts)
  if (payload.parts?.length) {
    // Try HTML first
    const htmlPart = payload.parts.find((p) => p.mimeType === "text/html")
    if (htmlPart?.body?.data) {
      return decodeBase64(htmlPart.body.data)
    }

    // Fallback: plain text
    const textPart = payload.parts.find((p) => p.mimeType === "text/plain")
    if (textPart?.body?.data) {
      return decodeBase64(textPart.body.data)
    }

    // If still not found, recurse deeper
    for (const part of payload.parts) {
      const content = extractBody(part)
      if (content) return content
    }
  }

  return ""
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return new Response(
      JSON.stringify({ error: "Not authenticated" }),
      { status: 401 }
    )
  }

  try {
    // Fetch last 30 days of emails
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=newer_than:30d&maxResults=10",
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      }
    )

    if (!listRes.ok) {
      const error = await listRes.json()
      return new Response(JSON.stringify(error), { status: listRes.status })
    }

    const listData = await listRes.json()
    if (!listData.messages) {
      return new Response(JSON.stringify([]), { status: 200 })
    }

    // Get details for each message
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
        const subject =
          headers.find((h) => h.name === "Subject")?.value || "(no subject)"
        const from =
          headers.find((h) => h.name === "From")?.value || "(unknown sender)"
        const date =
          headers.find((h) => h.name === "Date")?.value || ""

        // ✅ Use recursive function to extract full body
        const body = extractBody(detail.payload)

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
  } catch (err) {
    console.error("Gmail API error:", err)
    return new Response(
      JSON.stringify({ error: "Failed to fetch Gmail data" }),
      { status: 500 }
    )
  }
}

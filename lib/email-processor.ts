// Email processing utilities for parsing and analyzing startup pitches

export interface EmailData {
  subject: string
  body: string
  from: string
  date: Date
  attachments: string[]
}

export interface ProcessedPitch {
  companyName?: string
  sector?: string
  stage?: string
  fundingAmount?: number
  location?: string
  description?: string
  relevanceScore: number
}

// AI-powered email analysis (mock implementation)
export async function analyzePitchEmail(email: EmailData): Promise<ProcessedPitch | null> {
  // In a real implementation, this would use AI/ML to:
  // 1. Identify if the email is a startup pitch
  // 2. Extract key information (company name, sector, funding stage, etc.)
  // 3. Calculate relevance score based on investor thesis
  // 4. Parse attachments for additional context

  const pitchKeywords = [
    "startup",
    "funding",
    "investment",
    "pitch",
    "series a",
    "seed",
    "pre-seed",
    "venture",
    "capital",
    "raise",
  ]

  const emailText = `${email.subject} ${email.body}`.toLowerCase()
  const hasPitchKeywords = pitchKeywords.some((keyword) => emailText.includes(keyword))

  if (!hasPitchKeywords) {
    return null // Not a pitch email
  }

  // Mock extraction logic (would be replaced with AI)
  const extractedData: ProcessedPitch = {
    companyName: extractCompanyName(email.subject, email.body),
    sector: extractSector(emailText),
    stage: extractFundingStage(emailText),
    fundingAmount: extractFundingAmount(emailText),
    location: extractLocation(emailText),
    description: extractDescription(email.body),
    relevanceScore: calculateRelevanceScore(emailText),
  }

  return extractedData
}

function extractCompanyName(subject: string, body: string): string | undefined {
  // Simple regex to find company names (would be enhanced with AI)
  const patterns = [
    /(?:company|startup|firm)\s+([A-Z][a-zA-Z\s]+)/i,
    /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(?:is|seeks|looking)/i,
  ]

  for (const pattern of patterns) {
    const match = subject.match(pattern) || body.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return undefined
}

function extractSector(text: string): string | undefined {
  const sectors = ["fintech", "healthtech", "edtech", "ai", "ml", "saas", "e-commerce", "cleantech", "agritech"]

  for (const sector of sectors) {
    if (text.includes(sector)) {
      return sector.charAt(0).toUpperCase() + sector.slice(1)
    }
  }

  return undefined
}

function extractFundingStage(text: string): string | undefined {
  const stages = ["pre-seed", "seed", "series a", "series b", "series c"]

  for (const stage of stages) {
    if (text.includes(stage)) {
      return stage
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    }
  }

  return undefined
}

function extractFundingAmount(text: string): number | undefined {
  const patterns = [/\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:million|m)/i, /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*k/i]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const amount = Number.parseFloat(match[1].replace(/,/g, ""))
      return text.includes("million") || text.includes("m") ? amount * 1000000 : amount * 1000
    }
  }

  return undefined
}

function extractLocation(text: string): string | undefined {
  // Simple location extraction (would be enhanced with NLP)
  const locationPatterns = [
    /(?:based in|located in|from)\s+([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/i,
    /([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})\s+based/i,
  ]

  for (const pattern of locationPatterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return undefined
}

function extractDescription(body: string): string | undefined {
  // Extract first paragraph or sentence as description
  const sentences = body.split(/[.!?]+/)
  const meaningfulSentences = sentences.filter((s) => s.trim().length > 50)

  return meaningfulSentences[0]?.trim().substring(0, 200) + "..."
}

function calculateRelevanceScore(text: string): number {
  // Simple scoring algorithm (would be enhanced with AI)
  let score = 50

  const highValueKeywords = ["ai", "ml", "saas", "fintech", "b2b"]
  const mediumValueKeywords = ["startup", "technology", "platform", "solution"]

  for (const keyword of highValueKeywords) {
    if (text.includes(keyword)) score += 15
  }

  for (const keyword of mediumValueKeywords) {
    if (text.includes(keyword)) score += 5
  }

  return Math.min(100, Math.max(0, score))
}

// Email template generation for investor responses
export function generateEmailTemplate(type: "meeting" | "rejection" | "followup", data: any): string {
  switch (type) {
    case "meeting":
      return `
Subject: Re: ${data.subject}

Dear ${data.founderName || "Founder"},

Thank you for reaching out and sharing information about ${data.companyName || "your startup"}. 

After reviewing your pitch, I'm interested in learning more about your ${data.sector || ""} solution. I'd like to schedule a brief call to discuss your business in more detail.

Would you be available for a 30-minute call next week? Please let me know a few times that work for you.

Best regards,
[Your Name]
      `.trim()

    case "rejection":
      return `
Subject: Re: ${data.subject}

Dear ${data.founderName || "Founder"},

Thank you for sharing information about ${data.companyName || "your startup"} with me.

After careful consideration, I've determined that this opportunity doesn't align with our current investment thesis and focus areas. However, I appreciate you thinking of us and wish you the best of luck with your fundraising efforts.

Best regards,
[Your Name]
      `.trim()

    case "followup":
      return `
Subject: Following up on ${data.companyName || "your startup"}

Dear ${data.founderName || "Founder"},

I wanted to follow up on our previous conversation about ${data.companyName || "your startup"}. 

I'm still interested in learning more about your progress and would appreciate an update on your recent developments, traction, and fundraising timeline.

Please let me know if you'd like to schedule a follow-up call.

Best regards,
[Your Name]
      `.trim()

    default:
      return ""
  }
}

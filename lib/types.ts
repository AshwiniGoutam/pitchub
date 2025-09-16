export interface User {
  _id?: string
  email: string
  name: string
  role: "investor" | "founder"
  createdAt: Date
  updatedAt: Date
  // Investor specific fields
  investorProfile?: {
    firm: string
    thesis: string[]
    sectors: string[]
    stagePreference: string[]
    checkSize: {
      min: number
      max: number
    }
  }
  // Founder specific fields
  founderProfile?: {
    company: string
    position: string
  }
}

export interface Startup {
  _id?: string
  name: string
  sector: string
  stage: string
  location: string
  fundingRequirement: {
    min: number
    max: number
  }
  pitchDeck?: string // Cloudinary URL
  description: string
  founderId: string
  relevanceScore?: number
  status: "submitted" | "under_review" | "contacted" | "rejected"
  createdAt: Date
  updatedAt: Date
  emailData?: {
    subject: string
    body: string
    attachments: string[]
  }
}

export interface EmailIntegration {
  _id?: string
  userId: string
  provider: "gmail" | "outlook"
  accessToken: string
  refreshToken: string
  isActive: boolean
  lastSync: Date
  createdAt: Date
}

export interface MatchingResult {
  _id?: string
  startupId: string
  investorId: string
  relevanceScore: number
  matchingFactors: string[]
  status: "pending" | "contacted" | "rejected"
  createdAt: Date
}

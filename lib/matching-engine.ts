import type { Startup, MatchingResult } from "./types"

export interface InvestorThesis {
  sectors: string[]
  stages: string[]
  checkSizeMin: number
  checkSizeMax: number
  geographies: string[]
  keywords: string[]
  excludedKeywords: string[]
}

export interface MatchingFactors {
  sectorMatch: number
  stageMatch: number
  checkSizeMatch: number
  geographyMatch: number
  keywordMatch: number
  timingMatch: number
}

export class MatchingEngine {
  /**
   * Calculate relevance score between a startup and investor
   */
  static calculateRelevanceScore(
    startup: Startup,
    investorThesis: InvestorThesis,
  ): {
    score: number
    factors: MatchingFactors
    reasoning: string[]
  } {
    const factors: MatchingFactors = {
      sectorMatch: this.calculateSectorMatch(startup.sector, investorThesis.sectors),
      stageMatch: this.calculateStageMatch(startup.stage, investorThesis.stages),
      checkSizeMatch: this.calculateCheckSizeMatch(startup.fundingRequirement, investorThesis),
      geographyMatch: this.calculateGeographyMatch(startup.location, investorThesis.geographies),
      keywordMatch: this.calculateKeywordMatch(startup.description, investorThesis),
      timingMatch: this.calculateTimingMatch(startup.createdAt),
    }

    // Weighted scoring
    const weights = {
      sectorMatch: 0.25,
      stageMatch: 0.2,
      checkSizeMatch: 0.2,
      geographyMatch: 0.1,
      keywordMatch: 0.15,
      timingMatch: 0.1,
    }

    const score = Math.round(
      factors.sectorMatch * weights.sectorMatch +
      factors.stageMatch * weights.stageMatch +
      factors.checkSizeMatch * weights.checkSizeMatch +
      factors.geographyMatch * weights.geographyMatch +
      factors.keywordMatch * weights.keywordMatch +
      factors.timingMatch * weights.timingMatch,
    )

    const reasoning = this.generateReasoning(factors, startup, investorThesis)

    return { score, factors, reasoning }
  }

  private static calculateSectorMatch(startupSector: string, investorSectors: string[]): number {
    if (investorSectors.length === 0) return 50 // Neutral if no preference

    // Exact match
    if (investorSectors.includes(startupSector)) return 100

    // Partial matches for related sectors
    const sectorMappings: Record<string, string[]> = {
      Fintech: ["SaaS", "AI/ML", "E-commerce"],
      HealthTech: ["AI/ML", "SaaS"],
      EdTech: ["SaaS", "AI/ML"],
      "AI/ML": ["Fintech", "HealthTech", "EdTech", "SaaS"],
      SaaS: ["Fintech", "HealthTech", "EdTech", "AI/ML"],
    }

    const relatedSectors = sectorMappings[startupSector] || []
    const hasRelatedMatch = relatedSectors.some((sector) => investorSectors.includes(sector))

    return hasRelatedMatch ? 70 : 20
  }

  private static calculateStageMatch(startupStage: string, investorStages: string[]): number {
    if (investorStages.length === 0) return 50

    if (investorStages.includes(startupStage)) return 100

    // Adjacent stage matching
    const stageOrder = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"]
    const startupIndex = stageOrder.indexOf(startupStage)
    const investorIndices = investorStages.map((stage) => stageOrder.indexOf(stage))

    const minDistance = Math.min(...investorIndices.map((idx) => Math.abs(idx - startupIndex)))

    if (minDistance === 1) return 75 // Adjacent stage
    if (minDistance === 2) return 50 // Two stages away
    return 25 // Further away
  }

  private static calculateCheckSizeMatch(
    fundingRequirement: { min: number; max: number },
    investorThesis: InvestorThesis,
  ): number {
    const startupAvg = (fundingRequirement.min + fundingRequirement.max) / 2
    const investorAvg = (investorThesis.checkSizeMin + investorThesis.checkSizeMax) / 2

    // Perfect overlap
    if (
      fundingRequirement.min <= investorThesis.checkSizeMax &&
      fundingRequirement.max >= investorThesis.checkSizeMin
    ) {
      return 100
    }

    // Calculate distance from investor range
    const distance = Math.min(
      Math.abs(startupAvg - investorThesis.checkSizeMin),
      Math.abs(startupAvg - investorThesis.checkSizeMax),
    )

    const maxDistance = investorAvg * 2 // Allow 2x deviation
    const score = Math.max(0, 100 - (distance / maxDistance) * 100)

    return Math.round(score)
  }

  private static calculateGeographyMatch(startupLocation: string, investorGeographies: string[]): number {
    if (investorGeographies.length === 0) return 50

    // Extract country/region from location
    const startupRegion = this.extractRegion(startupLocation)

    for (const geography of investorGeographies) {
      if (startupLocation.toLowerCase().includes(geography.toLowerCase())) return 100
      if (startupRegion && geography.toLowerCase().includes(startupRegion.toLowerCase())) return 80
    }

    return 30
  }
  private static calculateKeywordMatch(description: string | undefined, investorThesis: InvestorThesis): number {
    const descriptionLower = (description || "").toLowerCase(); // Ensure description is a string
    let score = 50;

    // Positive keywords
    const positiveMatches = investorThesis.keywords.filter((keyword) =>
      descriptionLower.includes(keyword.toLowerCase())
    );
    score += positiveMatches.length * 10;

    // Negative keywords (exclusions)
    const negativeMatches = investorThesis.excludedKeywords.filter((keyword) =>
      descriptionLower.includes(keyword.toLowerCase())
    );
    score -= negativeMatches.length * 20;

    return Math.max(0, Math.min(100, score));
  }


  private static calculateTimingMatch(createdAt: Date): number {
    const now = new Date()
    const daysSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)

    // Recent pitches get higher scores
    if (daysSinceCreated <= 1) return 100 // Same day
    if (daysSinceCreated <= 7) return 90 // Within a week
    if (daysSinceCreated <= 30) return 70 // Within a month
    if (daysSinceCreated <= 90) return 50 // Within 3 months
    return 30 // Older than 3 months
  }

  private static extractRegion(location: string): string | null {
    const regions = ["US", "USA", "United States", "UK", "Europe", "Asia", "Canada", "Australia"]
    for (const region of regions) {
      if (location.includes(region)) return region
    }
    return null
  }

  private static generateReasoning(
    factors: MatchingFactors,
    startup: Startup,
    investorThesis: InvestorThesis,
  ): string[] {
    const reasoning: string[] = []

    // Sector reasoning
    if (factors.sectorMatch >= 100) {
      reasoning.push(`Perfect sector match: ${startup.sector} is in your focus areas`)
    } else if (factors.sectorMatch >= 70) {
      reasoning.push(`Good sector alignment: ${startup.sector} is related to your focus areas`)
    } else if (factors.sectorMatch <= 30) {
      reasoning.push(`Limited sector fit: ${startup.sector} is outside your typical focus`)
    }

    // Stage reasoning
    if (factors.stageMatch >= 100) {
      reasoning.push(`Perfect stage match: ${startup.stage} aligns with your investment stage`)
    } else if (factors.stageMatch >= 75) {
      reasoning.push(`Good stage fit: ${startup.stage} is close to your preferred stages`)
    }

    // Check size reasoning
    const fundingRange = `$${(startup.fundingRequirement.min / 1000000).toFixed(1)}M - $${(startup.fundingRequirement.max / 1000000).toFixed(1)}M`
    if (factors.checkSizeMatch >= 100) {
      reasoning.push(`Perfect check size match: ${fundingRange} fits your investment range`)
    } else if (factors.checkSizeMatch >= 70) {
      reasoning.push(`Good check size alignment: ${fundingRange} is close to your typical range`)
    } else if (factors.checkSizeMatch <= 40) {
      reasoning.push(`Check size mismatch: ${fundingRange} may be outside your typical range`)
    }

    // Timing reasoning
    if (factors.timingMatch >= 90) {
      reasoning.push("Recent pitch: High priority for immediate review")
    } else if (factors.timingMatch <= 40) {
      reasoning.push("Older pitch: May require follow-up on current status")
    }

    return reasoning
  }

  /**
   * Batch process multiple startups against investor thesis
   */
  static batchMatch(startups: Startup[], investorThesis: InvestorThesis): MatchingResult[] {
    return startups
      .map((startup) => {
        const { score, factors, reasoning } = this.calculateRelevanceScore(startup, investorThesis)

        return {
          startupId: startup._id!,
          investorId: "temp-investor-id", // Would come from session
          relevanceScore: score,
          matchingFactors: reasoning,
          status: "pending" as const,
          createdAt: new Date(),
        }
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  /**
   * Get recommended actions based on relevance score
   */
  static getRecommendedAction(score: number): {
    action: "contact" | "review" | "reject" | "monitor"
    priority: "high" | "medium" | "low"
    message: string
  } {
    if (score >= 85) {
      return {
        action: "contact",
        priority: "high",
        message: "Excellent match - recommend immediate contact",
      }
    } else if (score >= 70) {
      return {
        action: "review",
        priority: "medium",
        message: "Good match - worth detailed review",
      }
    } else if (score >= 50) {
      return {
        action: "monitor",
        priority: "low",
        message: "Moderate match - monitor for updates",
      }
    } else {
      return {
        action: "reject",
        priority: "low",
        message: "Poor match - likely not suitable",
      }
    }
  }

  /**
   * Update investor thesis based on their actions
   */
  static updateThesisFromActions(
    currentThesis: InvestorThesis,
    actions: Array<{ startup: Startup; action: "contacted" | "rejected"; score: number }>,
  ): InvestorThesis {
    // Machine learning approach to refine thesis based on investor behavior
    const updatedThesis = { ...currentThesis }

    // Analyze contacted vs rejected patterns
    const contacted = actions.filter((a) => a.action === "contacted")
    const rejected = actions.filter((a) => a.action === "rejected")

    // Update sector preferences based on actions
    const contactedSectors = contacted.map((a) => a.startup.sector)
    const rejectedSectors = rejected.map((a) => a.startup.sector)

    // Boost sectors that were contacted
    contactedSectors.forEach((sector) => {
      if (!updatedThesis.sectors.includes(sector)) {
        updatedThesis.sectors.push(sector)
      }
    })

    // This would be enhanced with more sophisticated ML algorithms
    return updatedThesis
  }
}

// Utility functions for thesis management
export class ThesisManager {
  static getDefaultThesis(): InvestorThesis {
    return {
      sectors: [],
      stages: [],
      checkSizeMin: 0,
      checkSizeMax: 0,
      geographies: [],
      keywords: [],
      excludedKeywords: [],
    }
  }

  static validateThesis(thesis: InvestorThesis): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (thesis.sectors.length === 0) {
      errors.push("At least one sector must be specified")
    }

    if (thesis.stages.length === 0) {
      errors.push("At least one funding stage must be specified")
    }

    if (thesis.checkSizeMin >= thesis.checkSizeMax) {
      errors.push("Minimum check size must be less than maximum check size")
    }

    if (thesis.checkSizeMin < 0 || thesis.checkSizeMax < 0) {
      errors.push("Check sizes must be positive numbers")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static serializeThesis(thesis: InvestorThesis): string {
    return JSON.stringify(thesis)
  }

  static deserializeThesis(serialized: string): InvestorThesis {
    try {
      return JSON.parse(serialized)
    } catch {
      return this.getDefaultThesis()
    }
  }
}

// MongoDB setup script for Pitchub collections
// Run this script to initialize the database with proper indexes

const { MongoClient } = require("mongodb")

async function setupMongoDB() {
  const uri = "your_mongodb_connection_string" // Replace with your MongoDB connection string
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

  try {
    await client.connect()
    const database = client.db("pitchub")
    const db = database

    // Create users collection with indexes
    db.collection("users").createIndex({ email: 1 }, { unique: true })
    db.collection("users").createIndex({ role: 1 })
    db.collection("users").createIndex({ createdAt: -1 })

    // Create startups collection with indexes
    db.collection("startups").createIndex({ founderId: 1 })
    db.collection("startups").createIndex({ sector: 1 })
    db.collection("startups").createIndex({ stage: 1 })
    db.collection("startups").createIndex({ status: 1 })
    db.collection("startups").createIndex({ relevanceScore: -1 })
    db.collection("startups").createIndex({ createdAt: -1 })

    // Create email integrations collection
    db.collection("emailIntegrations").createIndex({ userId: 1 }, { unique: true })
    db.collection("emailIntegrations").createIndex({ provider: 1 })
    db.collection("emailIntegrations").createIndex({ isActive: 1 })

    // Create matching results collection
    db.collection("matchingResults").createIndex({ startupId: 1, investorId: 1 }, { unique: true })
    db.collection("matchingResults").createIndex({ investorId: 1 })
    db.collection("matchingResults").createIndex({ relevanceScore: -1 })
    db.collection("matchingResults").createIndex({ status: 1 })
    db.collection("matchingResults").createIndex({ createdAt: -1 })

    // Insert sample data for development
    await db.collection("users").insertMany([
      {
        email: "investor@example.com",
        name: "John Investor",
        role: "investor",
        createdAt: new Date(),
        updatedAt: new Date(),
        investorProfile: {
          firm: "Acme Ventures",
          thesis: ["B2B SaaS", "Fintech", "AI/ML"],
          sectors: ["Fintech", "HealthTech", "EdTech"],
          stagePreference: ["Seed", "Series A"],
          checkSize: {
            min: 100000,
            max: 2000000,
          },
        },
      },
      {
        email: "founder@startup.com",
        name: "Jane Founder",
        role: "founder",
        createdAt: new Date(),
        updatedAt: new Date(),
        founderProfile: {
          company: "TechStartup Inc",
          position: "CEO",
        },
      },
    ])

    console.log("MongoDB setup completed successfully!")
  } finally {
    await client.close()
  }
}

setupMongoDB().catch(console.error)

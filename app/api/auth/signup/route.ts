import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import type { User } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, firm, company } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user object
    const userData: Partial<User> = {
      name,
      email,
      password: hashedPassword,
      role: role as "investor" | "founder",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Add role-specific profile data
    if (role === "investor") {
      userData.investorProfile = {
        firm: firm || "",
        thesis: [],
        sectors: [],
        stagePreference: [],
        checkSize: { min: 0, max: 0 },
      }
    } else if (role === "founder") {
      userData.founderProfile = {
        company: company || "",
        position: "Founder",
      }
    }

    // Insert user into database
    const result = await db.collection("users").insertOne(userData)

    // Get the created user without password
    const newUser = await db.collection("users").findOne({ _id: result.insertedId }, { projection: { password: 0 } })

    return NextResponse.json({
      message: "User created successfully",
      user: newUser,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { users, verificationTokens } from "@/db/schema"
import { eq } from "drizzle-orm"
import { hashPassword, generateVerificationToken } from "@/lib/auth-utils"
import { sendVerificationEmail } from "@/lib/email"
import { checkRateLimit } from "@/lib/redis"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(50).optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const isAllowed = await checkRateLimit(`register:${ip}`, 5, 300) // 5 attempts per 5 minutes
    
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      )
    }

    const body = await req.json()
    const validation = registerSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const { email, password, name } = validation.data

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((res) => res[0])

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate verification token
    const { token, hashedToken } = generateVerificationToken()

    // Create user
    const userId = crypto.randomUUID()
    await db.insert(users).values({
      id: userId,
      email,
      password: hashedPassword,
      name,
    })
    
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((res) => res[0])

    // Create verification token
    await db.insert(verificationTokens).values({
      identifier: user.email,
      token: hashedToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    })

    // Send verification email
    await sendVerificationEmail(email, token)

    return NextResponse.json(
      {
        message: "Registration successful. Please check your email to verify your account.",
        userId: user.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { users, passwordResets } from "@/db/schema"
import { eq, and, gt } from "drizzle-orm"
import { generateSecureToken } from "@/lib/auth-utils"
import { sendPasswordResetEmail } from "@/lib/email"
import { checkRateLimit } from "@/lib/redis"

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const isAllowed = await checkRateLimit(`forgot-password:${ip}`, 3, 300) // 3 attempts per 5 minutes
    
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again later." },
        { status: 429 }
      )
    }

    const body = await req.json()
    const validation = forgotPasswordSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    const { email } = validation.data

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((res) => res[0])

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json(
        { message: "If an account exists with this email, you will receive a password reset link." },
        { status: 200 }
      )
    }

    // Check if there's an existing unexpired reset token
    const existingReset = await db
      .select()
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.userId, user.id),
          gt(passwordResets.expires, new Date()),
          eq(passwordResets.used, false)
        )
      )
      .then((res) => res[0])

    if (existingReset) {
      // Don't send another email if there's a valid token
      return NextResponse.json(
        { message: "If an account exists with this email, you will receive a password reset link." },
        { status: 200 }
      )
    }

    // Generate reset token
    const token = generateSecureToken()

    // Create password reset record
    await db.insert(passwordResets).values({
      id: crypto.randomUUID(),
      token,
      userId: user.id,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      used: false,
    })

    // Send reset email
    await sendPasswordResetEmail(email, token)

    return NextResponse.json(
      { message: "If an account exists with this email, you will receive a password reset link." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    )
  }
}
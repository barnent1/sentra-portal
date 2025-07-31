import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import { db } from "@/lib/db"
import { users, verificationTokens } from "@/db/schema"
import { eq } from "drizzle-orm"

const verifySchema = z.object({
  token: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = verifySchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      )
    }

    const { token } = validation.data
    
    // Hash the token to match what's stored in the database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    // Find the verification token
    const verificationToken = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, hashedToken))
      .then((res) => res[0])

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.token, hashedToken))
      
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      )
    }

    // Update user as verified
    await db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.email, verificationToken.identifier))

    // Delete the used token
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.token, hashedToken))

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "An error occurred during email verification" },
      { status: 500 }
    )
  }
}
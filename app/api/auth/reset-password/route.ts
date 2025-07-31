import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth-utils"

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(100),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = resetPasswordSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      )
    }

    const { token, password } = validation.data

    // Find the password reset token
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!passwordReset) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (passwordReset.expires < new Date()) {
      // Delete expired token
      await prisma.passwordReset.delete({
        where: { id: passwordReset.id },
      })
      
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      )
    }

    // Check if token has already been used
    if (passwordReset.used) {
      return NextResponse.json(
        { error: "Reset token has already been used" },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password)

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: passwordReset.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { used: true },
      }),
    ])

    // Delete all other password reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: {
        userId: passwordReset.userId,
        id: { not: passwordReset.id },
      },
    })

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: "An error occurred resetting your password" },
      { status: 500 }
    )
  }
}
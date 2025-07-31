import { NextRequest, NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/middleware/auth"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{
    provider: string
  }>
}

// Disconnect OAuth account
export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    if (!req.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { provider } = await params

    // Check if user has other sign-in methods
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        accounts: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Ensure user has at least one sign-in method
    if (user.accounts.length <= 1 && !user.password) {
      return NextResponse.json(
        { error: "Cannot disconnect the only sign-in method. Please set a password first." },
        { status: 400 }
      )
    }

    // Delete the OAuth account
    await prisma.account.deleteMany({
      where: {
        userId: req.user.userId,
        provider,
      },
    })

    return NextResponse.json({
      message: `${provider} account disconnected successfully`,
    })
  } catch (error) {
    console.error("Disconnect account error:", error)
    return NextResponse.json(
      { error: "An error occurred disconnecting the account" },
      { status: 500 }
    )
  }
})
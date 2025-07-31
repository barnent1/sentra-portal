import { NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/middleware/auth"
import { prisma } from "@/lib/prisma"

// Get connected OAuth accounts
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const accounts = await prisma.account.findMany({
      where: { userId: req.user.userId },
      select: {
        provider: true,
        providerAccountId: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Get accounts error:", error)
    return NextResponse.json(
      { error: "An error occurred fetching accounts" },
      { status: 500 }
    )
  }
})
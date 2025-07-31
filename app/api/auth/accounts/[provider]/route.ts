import { NextRequest, NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/middleware/auth"
import { db } from "@/lib/db"
import { users, accounts } from "@/db/schema"
import { eq, and } from "drizzle-orm"

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
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.userId))
      .then((res) => res[0])
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, req.user.userId))

    // Ensure user has at least one sign-in method
    if (userAccounts.length <= 1 && !user.password) {
      return NextResponse.json(
        { error: "Cannot disconnect the only sign-in method. Please set a password first." },
        { status: 400 }
      )
    }

    // Delete the OAuth account
    await db
      .delete(accounts)
      .where(
        and(
          eq(accounts.userId, req.user.userId),
          eq(accounts.provider, provider)
        )
      )

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
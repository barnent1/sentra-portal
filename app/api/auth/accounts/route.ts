import { NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/middleware/auth"
import { db } from "@/lib/db"
import { accounts } from "@/db/schema"
import { eq } from "drizzle-orm"

// Get connected OAuth accounts
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userAccounts = await db
      .select({
        provider: accounts.provider,
        providerAccountId: accounts.providerAccountId,
        createdAt: accounts.createdAt,
      })
      .from(accounts)
      .where(eq(accounts.userId, req.user.userId))

    return NextResponse.json({ accounts: userAccounts })
  } catch (error) {
    console.error("Get accounts error:", error)
    return NextResponse.json(
      { error: "An error occurred fetching accounts" },
      { status: 500 }
    )
  }
})
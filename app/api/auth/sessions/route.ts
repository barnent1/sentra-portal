import { NextRequest, NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/middleware/auth"
import { SessionManager } from "@/lib/session-manager"

// Get all user sessions
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const sessions = await SessionManager.getUserSessions(req.user.userId)
    const stats = await SessionManager.getSessionStats(req.user.userId)

    return NextResponse.json({
      sessions,
      stats,
    })
  } catch (error) {
    console.error("Get sessions error:", error)
    return NextResponse.json(
      { error: "An error occurred fetching sessions" },
      { status: 500 }
    )
  }
})

// Delete all other sessions
export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get current session ID from request
    const authHeader = req.headers.get("authorization")
    const currentSessionId = authHeader?.split(" ")[1] || ""

    const deletedCount = await SessionManager.deleteOtherUserSessions(
      req.user.userId,
      currentSessionId
    )

    return NextResponse.json({
      message: `Signed out from ${deletedCount} other sessions`,
      deletedCount,
    })
  } catch (error) {
    console.error("Delete sessions error:", error)
    return NextResponse.json(
      { error: "An error occurred deleting sessions" },
      { status: 500 }
    )
  }
})
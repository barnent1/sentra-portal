import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { SessionManager } from "@/lib/session-manager"

export async function trackSessionActivity(req: NextRequest) {
  try {
    // Get the JWT token
    const token = await getToken({ req })
    
    if (token && token.id) {
      // Get session ID from a custom header or cookie
      // In a real implementation, you'd store the session ID in a secure cookie
      const sessionId = req.cookies.get("session-id")?.value
      
      if (sessionId) {
        await SessionManager.updateActivity(sessionId)
      }
    }
  } catch (error) {
    // Don't block the request if session tracking fails
    console.error("Session tracking error:", error)
  }
}

export function withSessionTracking(middleware: (req: NextRequest) => NextResponse | Promise<NextResponse>) {
  return async (req: NextRequest) => {
    // Track session activity
    await trackSessionActivity(req)
    
    // Continue with the original middleware
    return middleware(req)
  }
}
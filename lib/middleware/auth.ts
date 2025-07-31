import { NextRequest, NextResponse } from "next/server"
import { extractTokenFromHeader, verifyToken, isTokenBlacklisted } from "@/lib/jwt"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
  }
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options?: {
    requireAuth?: boolean
  }
) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get("authorization")
    const token = extractTokenFromHeader(authHeader)
    
    if (!token && options?.requireAuth !== false) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    if (token) {
      // Check if token is blacklisted
      const isBlacklisted = await isTokenBlacklisted(token)
      if (isBlacklisted) {
        return NextResponse.json(
          { error: "Token has been revoked" },
          { status: 401 }
        )
      }

      const payload = verifyToken(token)
      if (!payload || payload.type !== "access") {
        return NextResponse.json(
          { error: "Invalid access token" },
          { status: 401 }
        )
      }

      // Add user info to request
      (req as AuthenticatedRequest).user = {
        userId: payload.userId,
        email: payload.email,
      }
    }

    return handler(req as AuthenticatedRequest)
  }
}
import { NextRequest, NextResponse } from "next/server"
import { extractTokenFromHeader, verifyToken, blacklistToken, revokeRefreshToken } from "@/lib/jwt"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    // Blacklist the access token
    await blacklistToken(token)
    
    // Revoke the refresh token
    await revokeRefreshToken(payload.userId)

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    )
  }
}
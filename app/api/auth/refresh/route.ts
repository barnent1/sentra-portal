import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { refreshAccessToken } from "@/lib/jwt"

const refreshSchema = z.object({
  refreshToken: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = refreshSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    const { refreshToken } = validation.data
    const tokens = await refreshAccessToken(refreshToken)
    
    if (!tokens) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json(
      { error: "An error occurred during token refresh" },
      { status: 500 }
    )
  }
}
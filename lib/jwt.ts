import jwt from "jsonwebtoken"
import { redis } from "./redis"

const JWT_SECRET = process.env.JWT_SECRET!
const ACCESS_TOKEN_EXPIRES_IN = "15m"
const REFRESH_TOKEN_EXPIRES_IN = "7d"

export interface TokenPayload {
  userId: string
  email: string
  type: "access" | "refresh"
}

export interface JWTTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// Generate both access and refresh tokens
export async function generateTokens(userId: string, email: string): Promise<JWTTokens> {
  const accessPayload: TokenPayload = { userId, email, type: "access" }
  const refreshPayload: TokenPayload = { userId, email, type: "refresh" }

  const accessToken = jwt.sign(accessPayload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  })

  const refreshToken = jwt.sign(refreshPayload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  })

  // Store refresh token in Redis
  await redis.setex(
    `refresh_token:${userId}`,
    7 * 24 * 60 * 60, // 7 days in seconds
    refreshToken
  )

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  }
}

// Verify and decode token
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    return null
  }
}

// Refresh access token using refresh token
export async function refreshAccessToken(refreshToken: string): Promise<JWTTokens | null> {
  const payload = verifyToken(refreshToken)
  
  if (!payload || payload.type !== "refresh") {
    return null
  }

  // Check if refresh token exists in Redis
  const storedToken = await redis.get(`refresh_token:${payload.userId}`)
  
  if (!storedToken || storedToken !== refreshToken) {
    return null
  }

  // Generate new tokens
  return generateTokens(payload.userId, payload.email)
}

// Revoke refresh token
export async function revokeRefreshToken(userId: string): Promise<boolean> {
  const result = await redis.del(`refresh_token:${userId}`)
  return result === 1
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  
  return authHeader.substring(7)
}

// Blacklist a token (for logout)
export async function blacklistToken(token: string): Promise<void> {
  const payload = verifyToken(token)
  if (!payload) return

  // Calculate remaining TTL
  const decoded = jwt.decode(token) as any
  const ttl = decoded.exp - Math.floor(Date.now() / 1000)
  
  if (ttl > 0) {
    await redis.setex(`blacklist:${token}`, ttl, "1")
  }
}

// Check if token is blacklisted
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const result = await redis.get(`blacklist:${token}`)
  return result === "1"
}
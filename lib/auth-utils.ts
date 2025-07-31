import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: any, expiresIn: string = "7d"): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!)
  } catch (error) {
    return null
  }
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function generateVerificationToken(): { token: string; hashedToken: string } {
  const token = generateSecureToken()
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
  return { token, hashedToken }
}
import crypto from "crypto"
import { cookies } from "next/headers"

const CSRF_TOKEN_NAME = "csrf-token"
const CSRF_SECRET_NAME = "csrf-secret"

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies()
  let token = cookieStore.get(CSRF_TOKEN_NAME)?.value
  
  if (!token) {
    token = generateCSRFToken()
    cookieStore.set(CSRF_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    })
  }
  
  return token
}

export async function validateCSRFToken(token: string): Promise<boolean> {
  const cookieStore = await cookies()
  const storedToken = cookieStore.get(CSRF_TOKEN_NAME)?.value
  
  if (!storedToken || !token) {
    return false
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(storedToken),
    Buffer.from(token)
  )
}
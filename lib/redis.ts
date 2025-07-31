import Redis from "ioredis"

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL
  }
  
  throw new Error("REDIS_URL is not defined")
}

export const redis = new Redis(getRedisUrl())

// Session management functions
export async function setSession(sessionId: string, data: any, ttl: number = 86400) {
  return redis.setex(`session:${sessionId}`, ttl, JSON.stringify(data))
}

export async function getSession(sessionId: string) {
  const data = await redis.get(`session:${sessionId}`)
  return data ? JSON.parse(data) : null
}

export async function deleteSession(sessionId: string) {
  return redis.del(`session:${sessionId}`)
}

export async function extendSession(sessionId: string, ttl: number = 86400) {
  return redis.expire(`session:${sessionId}`, ttl)
}

// Rate limiting functions
export async function checkRateLimit(identifier: string, limit: number = 5, window: number = 60) {
  const key = `rate_limit:${identifier}`
  const current = await redis.incr(key)
  
  if (current === 1) {
    await redis.expire(key, window)
  }
  
  return current <= limit
}
import { redis } from "./redis"
import { generateSecureToken } from "./auth-utils"

interface SessionData {
  userId: string
  email: string
  ip?: string
  userAgent?: string
  createdAt: Date
  lastActivity: Date
}

const SESSION_PREFIX = "session:"
const USER_SESSIONS_PREFIX = "user_sessions:"
const SESSION_TTL = 30 * 24 * 60 * 60 // 30 days in seconds
const SESSION_ACTIVITY_UPDATE_INTERVAL = 5 * 60 // 5 minutes in seconds

export class SessionManager {
  // Create a new session
  static async createSession(
    userId: string,
    email: string,
    metadata?: { ip?: string; userAgent?: string }
  ): Promise<string> {
    const sessionId = generateSecureToken()
    const sessionKey = `${SESSION_PREFIX}${sessionId}`
    const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`

    const sessionData: SessionData = {
      userId,
      email,
      ip: metadata?.ip,
      userAgent: metadata?.userAgent,
      createdAt: new Date(),
      lastActivity: new Date(),
    }

    // Store session data
    await redis.setex(sessionKey, SESSION_TTL, JSON.stringify(sessionData))

    // Add session to user's session list
    await redis.sadd(userSessionsKey, sessionId)
    await redis.expire(userSessionsKey, SESSION_TTL)

    return sessionId
  }

  // Get session data
  static async getSession(sessionId: string): Promise<SessionData | null> {
    const sessionKey = `${SESSION_PREFIX}${sessionId}`
    const data = await redis.get(sessionKey)

    if (!data) {
      return null
    }

    try {
      const sessionData = JSON.parse(data)
      return {
        ...sessionData,
        createdAt: new Date(sessionData.createdAt),
        lastActivity: new Date(sessionData.lastActivity),
      }
    } catch (error) {
      return null
    }
  }

  // Update session activity
  static async updateActivity(sessionId: string): Promise<boolean> {
    const sessionKey = `${SESSION_PREFIX}${sessionId}`
    const session = await this.getSession(sessionId)

    if (!session) {
      return false
    }

    // Only update if enough time has passed since last activity
    const timeSinceLastActivity = 
      (new Date().getTime() - session.lastActivity.getTime()) / 1000

    if (timeSinceLastActivity < SESSION_ACTIVITY_UPDATE_INTERVAL) {
      return true // Session is still valid, no need to update
    }

    // Update last activity
    session.lastActivity = new Date()
    await redis.setex(sessionKey, SESSION_TTL, JSON.stringify(session))

    return true
  }

  // Extend session TTL
  static async extendSession(sessionId: string): Promise<boolean> {
    const sessionKey = `${SESSION_PREFIX}${sessionId}`
    const session = await this.getSession(sessionId)

    if (!session) {
      return false
    }

    await redis.expire(sessionKey, SESSION_TTL)
    return true
  }

  // Delete a specific session
  static async deleteSession(sessionId: string): Promise<boolean> {
    const sessionKey = `${SESSION_PREFIX}${sessionId}`
    const session = await this.getSession(sessionId)

    if (!session) {
      return false
    }

    // Remove from user's session list
    const userSessionsKey = `${USER_SESSIONS_PREFIX}${session.userId}`
    await redis.srem(userSessionsKey, sessionId)

    // Delete session
    const deleted = await redis.del(sessionKey)
    return deleted === 1
  }

  // Get all sessions for a user
  static async getUserSessions(userId: string): Promise<SessionData[]> {
    const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`
    const sessionIds = await redis.smembers(userSessionsKey)

    const sessions: SessionData[] = []
    
    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId)
      if (session) {
        sessions.push(session)
      } else {
        // Clean up invalid session from user's list
        await redis.srem(userSessionsKey, sessionId)
      }
    }

    return sessions.sort((a, b) => 
      b.lastActivity.getTime() - a.lastActivity.getTime()
    )
  }

  // Delete all sessions for a user
  static async deleteAllUserSessions(userId: string): Promise<number> {
    const sessions = await this.getUserSessions(userId)
    let deletedCount = 0

    for (const session of sessions) {
      const sessionId = await this.findSessionId(session)
      if (sessionId && await this.deleteSession(sessionId)) {
        deletedCount++
      }
    }

    // Clear user's session list
    const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`
    await redis.del(userSessionsKey)

    return deletedCount
  }

  // Delete all sessions except the current one
  static async deleteOtherUserSessions(
    userId: string,
    currentSessionId: string
  ): Promise<number> {
    const sessions = await this.getUserSessions(userId)
    let deletedCount = 0

    for (const session of sessions) {
      const sessionId = await this.findSessionId(session)
      if (sessionId && sessionId !== currentSessionId) {
        if (await this.deleteSession(sessionId)) {
          deletedCount++
        }
      }
    }

    return deletedCount
  }

  // Helper to find session ID from session data
  private static async findSessionId(sessionData: SessionData): Promise<string | null> {
    const userSessionsKey = `${USER_SESSIONS_PREFIX}${sessionData.userId}`
    const sessionIds = await redis.smembers(userSessionsKey)

    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId)
      if (session && 
          session.userId === sessionData.userId &&
          session.createdAt.getTime() === sessionData.createdAt.getTime()) {
        return sessionId
      }
    }

    return null
  }

  // Get session statistics for a user
  static async getSessionStats(userId: string) {
    const sessions = await this.getUserSessions(userId)
    
    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => {
        const hoursSinceActivity = 
          (new Date().getTime() - s.lastActivity.getTime()) / (1000 * 60 * 60)
        return hoursSinceActivity < 24 // Active within last 24 hours
      }).length,
      devices: [...new Set(sessions.map(s => s.userAgent || "Unknown"))],
      locations: [...new Set(sessions.map(s => s.ip || "Unknown"))],
    }
  }
}
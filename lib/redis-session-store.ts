import { sessions } from "./redis"
import { randomBytes } from "crypto"

// Session store interface compatible with NextAuth
export interface SessionData {
  id: string
  userId: string
  expires: Date
  sessionToken: string
  [key: string]: any
}

// Redis-based session store for NextAuth
export class RedisSessionStore {
  private readonly prefix = "auth:session:"
  private readonly ttl: number
  
  constructor(ttlSeconds: number = 86400) { // 24 hours default
    this.ttl = ttlSeconds
  }
  
  // Generate session token
  generateSessionToken(): string {
    return randomBytes(32).toString("hex")
  }
  
  // Create a new session
  async createSession(userId: string, additionalData?: Record<string, any>): Promise<SessionData> {
    const sessionToken = this.generateSessionToken()
    const expires = new Date(Date.now() + this.ttl * 1000)
    
    const sessionData: SessionData = {
      id: sessionToken,
      userId,
      expires,
      sessionToken,
      ...additionalData,
    }
    
    await sessions.set(sessionToken, sessionData, this.ttl)
    
    return sessionData
  }
  
  // Get session by token
  async getSession(sessionToken: string): Promise<SessionData | null> {
    const data = await sessions.get<SessionData>(sessionToken)
    
    if (!data) {
      return null
    }
    
    // Check if session is expired
    if (new Date(data.expires) < new Date()) {
      await this.deleteSession(sessionToken)
      return null
    }
    
    return data
  }
  
  // Update session
  async updateSession(
    sessionToken: string,
    updates: Partial<SessionData>
  ): Promise<SessionData | null> {
    const session = await this.getSession(sessionToken)
    
    if (!session) {
      return null
    }
    
    const updatedSession = {
      ...session,
      ...updates,
      sessionToken, // Ensure token doesn't change
      id: session.id, // Ensure ID doesn't change
    }
    
    await sessions.set(sessionToken, updatedSession, this.ttl)
    
    return updatedSession
  }
  
  // Delete session
  async deleteSession(sessionToken: string): Promise<void> {
    await sessions.delete(sessionToken)
  }
  
  // Delete all sessions for a user
  async deleteUserSessions(userId: string): Promise<number> {
    // Note: This requires scanning all sessions, which can be expensive
    // Consider maintaining a separate index of user->sessions for better performance
    const pattern = `${this.prefix}*`
    const keys = await sessions.redis.keys(pattern)
    
    let deletedCount = 0
    
    for (const key of keys) {
      const sessionData = await sessions.get<SessionData>(key.replace(this.prefix, ""))
      
      if (sessionData && sessionData.userId === userId) {
        await sessions.delete(key.replace(this.prefix, ""))
        deletedCount++
      }
    }
    
    return deletedCount
  }
  
  // Extend session expiry
  async touchSession(sessionToken: string): Promise<boolean> {
    const session = await this.getSession(sessionToken)
    
    if (!session) {
      return false
    }
    
    const newExpires = new Date(Date.now() + this.ttl * 1000)
    
    await this.updateSession(sessionToken, { expires: newExpires })
    await sessions.extend(sessionToken, this.ttl)
    
    return true
  }
  
  // Get all active sessions for a user
  async getUserSessions(userId: string): Promise<SessionData[]> {
    // Note: This requires scanning, consider maintaining an index
    const pattern = `${this.prefix}*`
    const keys = await sessions.redis.keys(pattern)
    
    const userSessions: SessionData[] = []
    
    for (const key of keys) {
      const sessionData = await sessions.get<SessionData>(key.replace(this.prefix, ""))
      
      if (sessionData && sessionData.userId === userId) {
        userSessions.push(sessionData)
      }
    }
    
    return userSessions
  }
  
  // Clean up expired sessions
  async cleanup(): Promise<number> {
    const pattern = `${this.prefix}*`
    const keys = await sessions.redis.keys(pattern)
    
    let cleanedCount = 0
    
    for (const key of keys) {
      const sessionToken = key.replace(this.prefix, "")
      const sessionData = await sessions.get<SessionData>(sessionToken)
      
      if (sessionData && new Date(sessionData.expires) < new Date()) {
        await sessions.delete(sessionToken)
        cleanedCount++
      }
    }
    
    return cleanedCount
  }
}

// Create default session store instance
export const sessionStore = new RedisSessionStore()

// NextAuth adapter functions
export const redisSessionAdapter = {
  async createSession(session: any) {
    const sessionData = await sessionStore.createSession(
      session.userId,
      {
        expires: session.expires,
        ...session,
      }
    )
    return sessionData
  },
  
  async getSessionAndUser(sessionToken: string) {
    const session = await sessionStore.getSession(sessionToken)
    if (!session) return null
    
    // You would fetch the user from your database here
    // For now, returning a mock structure
    return {
      session,
      user: { id: session.userId },
    }
  },
  
  async updateSession(sessionToken: string, session: any) {
    return await sessionStore.updateSession(sessionToken, session)
  },
  
  async deleteSession(sessionToken: string) {
    await sessionStore.deleteSession(sessionToken)
  },
}
import Redis, { RedisOptions } from "ioredis"

// Redis connection configuration
const getRedisConfig = (): RedisOptions => {
  const redisUrl = process.env.REDIS_URL
  
  if (!redisUrl) {
    throw new Error("REDIS_URL is not defined")
  }

  // Parse Redis URL to extract components
  const url = new URL(redisUrl)
  
  return {
    host: url.hostname,
    port: parseInt(url.port || "6379"),
    password: url.password || undefined,
    db: parseInt(url.pathname?.slice(1) || "0"),
    
    // Connection pool settings
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: false,
    
    // Connection settings
    connectTimeout: parseInt(process.env.REDIS_CONNECTION_TIMEOUT || "5000"),
    commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || "5000"),
    
    // Reconnection settings
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    
    // Connection pool size
    lazyConnect: false,
  }
}

// Create Redis client with connection pooling
export const redis = new Redis(getRedisConfig())

// Redis health check
redis.on("error", (error) => {
  console.error("Redis connection error:", error)
})

redis.on("connect", () => {
  console.log("Redis connected successfully")
})

// Graceful shutdown
process.on("SIGTERM", async () => {
  await redis.quit()
})

// Cache utilities
export const cache = {
  // Get cached value with automatic JSON parsing
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key)
    if (!value) return null
    
    try {
      return JSON.parse(value) as T
    } catch {
      return value as unknown as T
    }
  },
  
  // Set cached value with automatic JSON stringification
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === "string" ? value : JSON.stringify(value)
    
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized)
    } else {
      await redis.set(key, serialized)
    }
  },
  
  // Delete cached value
  async delete(key: string): Promise<void> {
    await redis.del(key)
  },
  
  // Check if key exists
  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key)
    return result === 1
  },
  
  // Clear all cache (use with caution)
  async clear(pattern: string = "*"): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  },
  
  // Get remaining TTL
  async ttl(key: string): Promise<number> {
    return await redis.ttl(key)
  },
}

// Session management
export const sessions = {
  // Create or update session
  async set(sessionId: string, data: any, ttlSeconds: number = 86400): Promise<void> {
    await cache.set(`session:${sessionId}`, data, ttlSeconds)
  },
  
  // Get session data
  async get<T = any>(sessionId: string): Promise<T | null> {
    return await cache.get<T>(`session:${sessionId}`)
  },
  
  // Delete session
  async delete(sessionId: string): Promise<void> {
    await cache.delete(`session:${sessionId}`)
  },
  
  // Extend session TTL
  async extend(sessionId: string, ttlSeconds: number = 86400): Promise<boolean> {
    const result = await redis.expire(`session:${sessionId}`, ttlSeconds)
    return result === 1
  },
  
  // Check if session exists
  async exists(sessionId: string): Promise<boolean> {
    return await cache.exists(`session:${sessionId}`)
  },
}

// Rate limiting utilities
export const rateLimiter = {
  // Check rate limit using sliding window
  async check(
    identifier: string,
    limit: number = 10,
    windowSeconds: number = 60
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const key = `rate_limit:${identifier}`
    const now = Date.now()
    const windowStart = now - windowSeconds * 1000
    
    // Remove old entries
    await redis.zremrangebyscore(key, 0, windowStart)
    
    // Count requests in current window
    const count = await redis.zcard(key)
    
    if (count < limit) {
      // Add current request
      await redis.zadd(key, now, `${now}-${Math.random()}`)
      await redis.expire(key, windowSeconds)
      
      return {
        allowed: true,
        remaining: limit - count - 1,
        resetAt: now + windowSeconds * 1000,
      }
    }
    
    // Get oldest entry to determine reset time
    const oldestEntry = await redis.zrange(key, 0, 0, "WITHSCORES")
    const resetAt = oldestEntry.length > 1 
      ? parseInt(oldestEntry[1]) + windowSeconds * 1000
      : now + windowSeconds * 1000
    
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    }
  },
  
  // Reset rate limit for identifier
  async reset(identifier: string): Promise<void> {
    await redis.del(`rate_limit:${identifier}`)
  },
}

// Distributed lock implementation
export const locks = {
  // Acquire lock with automatic expiration
  async acquire(
    lockName: string,
    ttlSeconds: number = 30,
    retries: number = 3
  ): Promise<boolean> {
    const lockKey = `lock:${lockName}`
    const lockValue = `${Date.now()}-${Math.random()}`
    
    for (let i = 0; i < retries; i++) {
      const result = await redis.set(lockKey, lockValue, "NX", "EX", ttlSeconds)
      
      if (result === "OK") {
        return true
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)))
    }
    
    return false
  },
  
  // Release lock
  async release(lockName: string): Promise<void> {
    await redis.del(`lock:${lockName}`)
  },
  
  // Execute function with lock
  async withLock<T>(
    lockName: string,
    fn: () => Promise<T>,
    ttlSeconds: number = 30
  ): Promise<T> {
    const acquired = await this.acquire(lockName, ttlSeconds)
    
    if (!acquired) {
      throw new Error(`Failed to acquire lock: ${lockName}`)
    }
    
    try {
      return await fn()
    } finally {
      await this.release(lockName)
    }
  },
}

// Pub/Sub utilities
export const pubsub = {
  // Publish message to channel
  async publish(channel: string, message: any): Promise<void> {
    const serialized = typeof message === "string" ? message : JSON.stringify(message)
    await redis.publish(channel, serialized)
  },
  
  // Subscribe to channel
  subscribe(channel: string, handler: (message: any) => void): Redis {
    const subscriber = new Redis(getRedisConfig())
    
    subscriber.subscribe(channel)
    
    subscriber.on("message", (receivedChannel, message) => {
      if (receivedChannel === channel) {
        try {
          const parsed = JSON.parse(message)
          handler(parsed)
        } catch {
          handler(message)
        }
      }
    })
    
    return subscriber
  },
}

// Export commonly used functions for backward compatibility
export const setSession = sessions.set
export const getSession = sessions.get
export const deleteSession = sessions.delete
export const extendSession = sessions.extend
export const checkRateLimit = async (
  identifier: string,
  limit: number = 5,
  window: number = 60
): Promise<boolean> => {
  const result = await rateLimiter.check(identifier, limit, window)
  return result.allowed
}
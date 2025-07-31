import { cache } from "./redis"

// Cache decorator options
interface CacheOptions {
  ttl?: number // Time to live in seconds
  keyPrefix?: string // Custom key prefix
  keyGenerator?: (...args: any[]) => string // Custom key generator
}

// Default key generator
function defaultKeyGenerator(target: any, propertyKey: string, args: any[]): string {
  const className = target.constructor.name
  const argsKey = JSON.stringify(args)
  return `${className}:${propertyKey}:${argsKey}`
}

// Cache decorator for methods
export function Cacheable(options: CacheOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // Generate cache key
      const keyGenerator = options.keyGenerator || defaultKeyGenerator
      const baseKey = keyGenerator(target, propertyKey, args)
      const cacheKey = options.keyPrefix 
        ? `${options.keyPrefix}:${baseKey}`
        : `cache:${baseKey}`

      // Try to get from cache
      const cachedResult = await cache.get(cacheKey)
      if (cachedResult !== null) {
        return cachedResult
      }

      // Execute original method
      const result = await originalMethod.apply(this, args)

      // Store in cache
      if (result !== undefined && result !== null) {
        await cache.set(cacheKey, result, options.ttl)
      }

      return result
    }

    return descriptor
  }
}

// Cache invalidation decorator
export function CacheInvalidate(patterns: string | string[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // Execute original method
      const result = await originalMethod.apply(this, args)

      // Invalidate cache
      const patternsArray = Array.isArray(patterns) ? patterns : [patterns]
      for (const pattern of patternsArray) {
        await cache.clear(pattern)
      }

      return result
    }

    return descriptor
  }
}

// Example usage:
/*
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

class UserService {
  @Cacheable({ ttl: 3600, keyPrefix: "user" })
  async getUser(id: string) {
    // Expensive database query
    return await db.select().from(users).where(eq(users.id, id)).then(res => res[0])
  }

  @CacheInvalidate("cache:user:*")
  async updateUser(id: string, data: any) {
    // Update user and invalidate cache
    return await db.update(users).set(data).where(eq(users.id, id))
  }
}
*/
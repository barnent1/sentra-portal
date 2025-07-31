import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RateLimitError } from './error-handler';
import { ApiResponseBuilder } from '@/lib/api/response-standards';

// Rate limit configurations
export interface RateLimitConfig {
  // Requests allowed per window
  limit: number;
  // Window duration in seconds
  window: number;
  // Optional custom identifier function
  identifier?: (request: NextRequest) => string;
  // Optional custom error message
  errorMessage?: string;
  // Whether to include rate limit headers
  includeHeaders?: boolean;
}

// Default configurations for different API endpoints
export const RateLimitConfigs = {
  // General API rate limit
  default: {
    limit: 100,
    window: 60, // 100 requests per minute
  },
  
  // Stricter limit for auth endpoints
  auth: {
    limit: 5,
    window: 60, // 5 requests per minute
  },
  
  // Very strict for password reset
  passwordReset: {
    limit: 3,
    window: 3600, // 3 requests per hour
  },
  
  // Relaxed for read operations
  read: {
    limit: 200,
    window: 60, // 200 requests per minute
  },
  
  // Moderate for write operations
  write: {
    limit: 30,
    window: 60, // 30 requests per minute
  },
} as const;

// Initialize Redis client
let redis: Redis | null = null;

function getRedisClient(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!url || !token) {
      throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
    }
    
    redis = new Redis({ url, token });
  }
  
  return redis;
}

// Create rate limiter instance
export function createRateLimiter(config: RateLimitConfig) {
  try {
    const redis = getRedisClient();
    
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.limit, `${config.window} s`),
      analytics: true,
    });
  } catch (error) {
    // If Redis is not configured, return null (disable rate limiting)
    console.warn('Rate limiting disabled: Redis not configured');
    return null;
  }
}

// Default identifier: IP address or user ID
function getDefaultIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header or session
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // Extract user ID from JWT or API key
    // This is a placeholder - implement based on your auth strategy
    const userId = extractUserIdFromAuth(authHeader);
    if (userId) return `user:${userId}`;
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'anonymous';
  return `ip:${ip}`;
}

// Placeholder for extracting user ID from auth
function extractUserIdFromAuth(authHeader: string): string | null {
  // TODO: Implement based on your authentication strategy
  // For JWT: decode and extract user ID
  // For API key: look up user ID from key
  return null;
}

// Rate limit middleware
export function withRateLimit(
  config: RateLimitConfig | keyof typeof RateLimitConfigs = 'default'
) {
  // Get config
  const rateLimitConfig: RateLimitConfig = 
    typeof config === 'string' ? RateLimitConfigs[config] : config;
  
  return function <T extends any[], R>(
    handler: (...args: T) => Promise<NextResponse | R>
  ) {
    return async (...args: T): Promise<NextResponse> => {
      const request = args[0] as NextRequest;
      
      // Create rate limiter
      const rateLimiter = createRateLimiter(rateLimitConfig);
      
      // If rate limiter is not available (Redis not configured), skip
      if (!rateLimiter) {
        return handler(...args) as Promise<NextResponse>;
      }
      
      // Get identifier
      const identifier = rateLimitConfig.identifier
        ? rateLimitConfig.identifier(request)
        : getDefaultIdentifier(request);
      
      // Check rate limit
      const { success, limit, reset, remaining } = await rateLimiter.limit(identifier);
      
      // If rate limit exceeded
      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);
        const message = rateLimitConfig.errorMessage || 'Too many requests';
        
        return ApiResponseBuilder.rateLimitExceeded(retryAfter, message);
      }
      
      // Call handler
      const response = await handler(...args);
      const nextResponse = response instanceof NextResponse 
        ? response 
        : NextResponse.json(response);
      
      // Add rate limit headers if requested
      if (rateLimitConfig.includeHeaders !== false) {
        nextResponse.headers.set('X-RateLimit-Limit', limit.toString());
        nextResponse.headers.set('X-RateLimit-Remaining', remaining.toString());
        nextResponse.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());
      }
      
      return nextResponse;
    };
  };
}

// Utility to check rate limit without blocking
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig | keyof typeof RateLimitConfigs = 'default'
): Promise<{
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const rateLimitConfig: RateLimitConfig = 
    typeof config === 'string' ? RateLimitConfigs[config] : config;
  
  const rateLimiter = createRateLimiter(rateLimitConfig);
  
  if (!rateLimiter) {
    return {
      allowed: true,
      limit: rateLimitConfig.limit,
      remaining: rateLimitConfig.limit,
      reset: Date.now() + rateLimitConfig.window * 1000,
    };
  }
  
  const result = await rateLimiter.limit(identifier, { rate: 0 });
  
  return {
    allowed: result.remaining > 0,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

// Rate limit by API key
export function rateLimitByApiKey(apiKey: string, config?: RateLimitConfig) {
  return withRateLimit({
    ...config,
    identifier: () => `api-key:${apiKey}`,
  });
}

// Rate limit by user ID
export function rateLimitByUserId(userId: string, config?: RateLimitConfig) {
  return withRateLimit({
    ...config,
    identifier: () => `user:${userId}`,
  });
}
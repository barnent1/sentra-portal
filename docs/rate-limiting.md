# Rate Limiting Documentation

This document describes the rate limiting implementation for the Sentra Portal API.

## Overview

Rate limiting is implemented using Upstash Redis to prevent abuse and ensure fair usage of API resources. The system uses a sliding window algorithm to track requests.

## Configuration

Rate limiting requires Upstash Redis. Set these environment variables:

```env
UPSTASH_REDIS_REST_URL=your-upstash-redis-rest-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-rest-token
```

If Redis is not configured, rate limiting will be disabled with a warning.

## Rate Limit Tiers

### Default Limits

| Tier | Limit | Window | Use Case |
|------|-------|--------|----------|
| `default` | 100 req/min | 60s | General API endpoints |
| `read` | 200 req/min | 60s | GET endpoints |
| `write` | 30 req/min | 60s | POST/PUT/DELETE endpoints |
| `auth` | 5 req/min | 60s | Authentication endpoints |
| `passwordReset` | 3 req/hour | 3600s | Password reset |

## Usage

### Basic Usage

```typescript
import { withRateLimit } from '@/lib/middleware';

// Use predefined tier
export const GET = withRateLimit('read')(handler);

// Custom configuration
export const POST = withRateLimit({
  limit: 10,
  window: 60,
  errorMessage: 'Custom rate limit message'
})(handler);
```

### With Combined Middleware

```typescript
import { combineMiddleware } from '@/lib/middleware';

export const GET = combineMiddleware(handler, {
  rateLimit: 'read',
  logging: true,
  cors: { origin: '*' }
});
```

### Custom Identifiers

By default, rate limiting uses IP address or authenticated user ID. You can provide custom identifiers:

```typescript
export const POST = withRateLimit({
  limit: 10,
  window: 60,
  identifier: (request) => {
    // Custom logic to identify user
    const apiKey = request.headers.get('x-api-key');
    return apiKey ? `api-key:${apiKey}` : 'anonymous';
  }
})(handler);
```

## Response Headers

Rate limited responses include these headers:

- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining in window
- `X-RateLimit-Reset` - When the window resets (ISO 8601)

## Rate Limit Exceeded Response

When rate limit is exceeded, the API returns:

```json
{
  "status": "error",
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

Status: `429 Too Many Requests`

Additional header: `Retry-After: <seconds>`

## Checking Rate Limits

You can check rate limits without consuming them:

```typescript
import { checkRateLimit } from '@/lib/middleware/rate-limit';

const status = await checkRateLimit('user:123', 'default');
console.log({
  allowed: status.allowed,
  remaining: status.remaining,
  reset: new Date(status.reset)
});
```

## Best Practices

1. **Use appropriate tiers** - Choose rate limit tiers based on endpoint sensitivity
2. **Custom limits for sensitive operations** - Use stricter limits for auth, payments, etc.
3. **Include rate limit info** - Return headers to help clients manage their requests
4. **Graceful degradation** - Handle Redis failures gracefully
5. **Monitor usage** - Track rate limit hits to identify potential issues

## Examples

### Protected API Route

```typescript
// app/api/protected/route.ts
export const GET = combineMiddleware(
  withValidation({ query: schema }),
  createApiHandler(async (request, context, validated) => {
    // Implementation
  }),
  {
    rateLimit: {
      limit: 50,
      window: 60,
      identifier: (req) => {
        const userId = getUserIdFromRequest(req);
        return userId ? `user:${userId}` : 'anonymous';
      }
    }
  }
);
```

### Public API with Different Limits

```typescript
// app/api/public/search/route.ts
export const GET = combineMiddleware(
  createApiHandler(async (request) => {
    const authenticated = isAuthenticated(request);
    
    // Different limits for authenticated vs anonymous
    return ApiResponseBuilder.success({ results: [] });
  }),
  {
    rateLimit: {
      limit: 20, // Anonymous limit
      window: 60,
      identifier: (req) => {
        const userId = getUserIdFromRequest(req);
        // Authenticated users get higher limit
        return userId ? `auth:${userId}` : `anon:${getIp(req)}`;
      }
    }
  }
);
```

## Troubleshooting

### Rate limiting not working

1. Check Redis configuration in environment variables
2. Verify Upstash Redis instance is running
3. Check application logs for connection errors

### Getting rate limited too quickly

1. Verify the correct tier is being used
2. Check if identifier is working correctly
3. Consider if limits need adjustment

### Headers not appearing

1. Ensure `includeHeaders` is not set to `false`
2. Check if response is being modified after middleware
# Redis Setup and Configuration

## Overview

This document describes the Redis setup for caching and session management in the Sentra Portal application.

## Local Development Setup

### Using Docker

```bash
# Run Redis with Docker
docker run -d \
  --name sentra-redis \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7-alpine \
  redis-server --appendonly yes

# Check Redis is running
docker logs sentra-redis
```

### Using Homebrew (macOS)

```bash
# Install Redis
brew install redis

# Start Redis service
brew services start redis

# Or run in foreground
redis-server
```

### Using Package Manager (Linux)

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## Configuration

### Environment Variables

```bash
# Basic Redis URL
REDIS_URL="redis://localhost:6379"

# With password
REDIS_URL="redis://:password@localhost:6379"

# With custom database
REDIS_URL="redis://localhost:6379/1"

# Connection settings
REDIS_CONNECTION_TIMEOUT="5000"     # Connection timeout in ms
REDIS_COMMAND_TIMEOUT="5000"        # Command timeout in ms
REDIS_POOL_SIZE="10"                # Connection pool size
```

## Redis Features Used

### 1. Session Management

Sessions are stored with the prefix `session:` and include:
- User ID
- Session token
- Expiration time
- Custom session data

```typescript
// Example session storage
await sessions.set(sessionId, userData, 86400) // 24 hours
const session = await sessions.get(sessionId)
await sessions.extend(sessionId, 86400)
await sessions.delete(sessionId)
```

### 2. Caching

General purpose caching with automatic JSON serialization:

```typescript
// Cache API responses
await cache.set("api:users:123", userData, 3600) // 1 hour
const cached = await cache.get("api:users:123")

// Clear cache patterns
await cache.clear("api:users:*")
```

### 3. Rate Limiting

Sliding window rate limiting for API endpoints:

```typescript
// Check rate limit
const { allowed, remaining, resetAt } = await rateLimiter.check(
  "api:key:123",
  100,  // 100 requests
  3600  // per hour
)

if (!allowed) {
  // Return 429 Too Many Requests
}
```

### 4. Distributed Locks

Prevent race conditions in distributed systems:

```typescript
// Acquire lock for critical section
const acquired = await locks.acquire("import:job:123", 30)

if (acquired) {
  try {
    // Perform exclusive operation
  } finally {
    await locks.release("import:job:123")
  }
}

// Or use helper function
await locks.withLock("process:payment:456", async () => {
  // Exclusive operation
}, 30)
```

### 5. Pub/Sub

Real-time messaging between services:

```typescript
// Subscribe to channel
const subscriber = pubsub.subscribe("notifications", (message) => {
  console.log("Received:", message)
})

// Publish message
await pubsub.publish("notifications", {
  type: "user-update",
  userId: "123",
  changes: { name: "New Name" }
})

// Cleanup
subscriber.quit()
```

## Monitoring

### Redis CLI

```bash
# Connect to Redis
redis-cli

# Monitor commands in real-time
redis-cli monitor

# Check server info
redis-cli info

# Check memory usage
redis-cli info memory

# View slow queries
redis-cli slowlog get 10
```

### Application Monitoring

```typescript
// Get Redis statistics
const stats = await getRedisStats()
console.log(stats)

// Monitor Redis performance
const monitor = await monitorRedis(60000) // Every minute

// Stop monitoring
clearInterval(monitor)
```

### Key Metrics to Monitor

1. **Memory Usage**: Keep below 80% of available memory
2. **Hit Rate**: Should be above 80% for effective caching
3. **Connected Clients**: Monitor for connection leaks
4. **Operations/Second**: Track performance trends
5. **Slow Queries**: Identify performance bottlenecks

## Production Considerations

### 1. Persistence

Configure Redis persistence for data durability:

```bash
# redis.conf
appendonly yes
appendfsync everysec
```

### 2. Memory Management

Set memory limits and eviction policies:

```bash
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

### 3. Security

Enable authentication and SSL:

```bash
# redis.conf
requirepass your-strong-password
port 0
tls-port 6379
tls-cert-file /path/to/cert.pem
tls-key-file /path/to/key.pem
```

### 4. High Availability

Use Redis Sentinel or Cluster for production:

```bash
# Redis Sentinel for automatic failover
redis-sentinel /path/to/sentinel.conf

# Redis Cluster for horizontal scaling
redis-cli --cluster create host1:6379 host2:6379 host3:6379
```

### 5. Backup

Regular backups of Redis data:

```bash
# Manual backup
redis-cli BGSAVE

# Copy RDB file
cp /var/lib/redis/dump.rdb /backup/redis-backup-$(date +%Y%m%d).rdb
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check Redis is running
   ps aux | grep redis
   # Check port is open
   netstat -tlnp | grep 6379
   ```

2. **Memory Issues**
   ```bash
   # Check memory usage
   redis-cli info memory
   # Force eviction
   redis-cli flushdb
   ```

3. **Performance Issues**
   ```bash
   # Check slow log
   redis-cli slowlog get 20
   # Monitor commands
   redis-cli monitor
   ```

### Cache Decorator Usage

Use decorators for automatic caching:

```typescript
class ProjectService {
  @Cacheable({ ttl: 3600, keyPrefix: "project" })
  async getProject(id: string) {
    return await prisma.project.findUnique({ where: { id } })
  }
  
  @CacheInvalidate("cache:project:*")
  async updateProject(id: string, data: any) {
    return await prisma.project.update({ where: { id }, data })
  }
}
```

## Maintenance

### Regular Tasks

1. **Monitor memory usage** - Daily
2. **Check slow queries** - Weekly
3. **Review hit rates** - Weekly
4. **Clean up expired keys** - Monthly
5. **Update Redis** - Quarterly

### Cleanup Script

```bash
#!/bin/bash
# Clean up expired sessions
redis-cli eval "
  local keys = redis.call('keys', 'session:*')
  local deleted = 0
  for i=1,#keys do
    local ttl = redis.call('ttl', keys[i])
    if ttl == -2 then
      deleted = deleted + 1
    end
  end
  return deleted
" 0
```
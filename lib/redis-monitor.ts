import { redis } from "./redis"

// Redis monitoring statistics
export interface RedisStats {
  connected: boolean
  uptime: number
  memoryUsage: {
    used: number
    peak: number
    percentage: number
  }
  clients: {
    connected: number
    blocked: number
  }
  stats: {
    totalConnections: number
    totalCommands: number
    instantaneousOps: number
    keyspaceHits: number
    keyspaceMisses: number
    hitRate: number
  }
  keyspace: {
    totalKeys: number
    expiringKeys: number
    databases: Record<string, { keys: number; expires: number }>
  }
}

// Get Redis server information
export async function getRedisInfo(): Promise<Record<string, any>> {
  const info = await redis.info()
  const sections: Record<string, any> = {}
  
  // Parse Redis INFO output
  const lines = info.split("\r\n")
  let currentSection = "general"
  
  for (const line of lines) {
    if (line.startsWith("#")) {
      currentSection = line.substring(2).toLowerCase()
      sections[currentSection] = {}
    } else if (line.includes(":")) {
      const [key, value] = line.split(":")
      if (!sections[currentSection]) {
        sections[currentSection] = {}
      }
      sections[currentSection][key] = value
    }
  }
  
  return sections
}

// Get Redis statistics
export async function getRedisStats(): Promise<RedisStats> {
  try {
    const info = await getRedisInfo()
    
    // Extract relevant statistics
    const server = info.server || {}
    const clients = info.clients || {}
    const memory = info.memory || {}
    const stats = info.stats || {}
    const keyspace = info.keyspace || {}
    
    // Calculate hit rate
    const hits = parseInt(stats.keyspace_hits || "0")
    const misses = parseInt(stats.keyspace_misses || "0")
    const total = hits + misses
    const hitRate = total > 0 ? (hits / total) * 100 : 0
    
    // Count total keys across all databases
    let totalKeys = 0
    let totalExpiring = 0
    const databases: Record<string, { keys: number; expires: number }> = {}
    
    for (const [dbName, dbInfo] of Object.entries(keyspace)) {
      if (dbName.startsWith("db")) {
        const match = (dbInfo as string).match(/keys=(\d+),expires=(\d+)/)
        if (match) {
          const keys = parseInt(match[1])
          const expires = parseInt(match[2])
          totalKeys += keys
          totalExpiring += expires
          databases[dbName] = { keys, expires }
        }
      }
    }
    
    return {
      connected: true,
      uptime: parseInt(server.uptime_in_seconds || "0"),
      memoryUsage: {
        used: parseInt(memory.used_memory || "0"),
        peak: parseInt(memory.used_memory_peak || "0"),
        percentage: parseFloat(memory.used_memory_peak_perc || "0"),
      },
      clients: {
        connected: parseInt(clients.connected_clients || "0"),
        blocked: parseInt(clients.blocked_clients || "0"),
      },
      stats: {
        totalConnections: parseInt(stats.total_connections_received || "0"),
        totalCommands: parseInt(stats.total_commands_processed || "0"),
        instantaneousOps: parseInt(stats.instantaneous_ops_per_sec || "0"),
        keyspaceHits: hits,
        keyspaceMisses: misses,
        hitRate,
      },
      keyspace: {
        totalKeys,
        expiringKeys: totalExpiring,
        databases,
      },
    }
  } catch (error) {
    console.error("Failed to get Redis stats:", error)
    return {
      connected: false,
      uptime: 0,
      memoryUsage: { used: 0, peak: 0, percentage: 0 },
      clients: { connected: 0, blocked: 0 },
      stats: {
        totalConnections: 0,
        totalCommands: 0,
        instantaneousOps: 0,
        keyspaceHits: 0,
        keyspaceMisses: 0,
        hitRate: 0,
      },
      keyspace: { totalKeys: 0, expiringKeys: 0, databases: {} },
    }
  }
}

// Monitor Redis performance
export async function monitorRedis(intervalMs: number = 60000): Promise<NodeJS.Timer> {
  const logStats = async () => {
    const stats = await getRedisStats()
    
    console.log("Redis Metrics:", {
      timestamp: new Date().toISOString(),
      connected: stats.connected,
      uptime: `${Math.floor(stats.uptime / 3600)}h ${Math.floor((stats.uptime % 3600) / 60)}m`,
      memory: `${(stats.memoryUsage.used / 1024 / 1024).toFixed(2)} MB`,
      clients: stats.clients.connected,
      opsPerSec: stats.stats.instantaneousOps,
      hitRate: `${stats.stats.hitRate.toFixed(2)}%`,
      totalKeys: stats.keyspace.totalKeys,
    })
    
    // Alert on high memory usage
    if (stats.memoryUsage.percentage > 80) {
      console.warn("WARNING: Redis memory usage above 80%", {
        used: `${(stats.memoryUsage.used / 1024 / 1024).toFixed(2)} MB`,
        peak: `${(stats.memoryUsage.peak / 1024 / 1024).toFixed(2)} MB`,
        percentage: `${stats.memoryUsage.percentage}%`,
      })
    }
    
    // Alert on low hit rate
    if (stats.stats.hitRate < 50 && stats.stats.keyspaceHits + stats.stats.keyspaceMisses > 1000) {
      console.warn("WARNING: Redis cache hit rate below 50%", {
        hitRate: `${stats.stats.hitRate.toFixed(2)}%`,
        hits: stats.stats.keyspaceHits,
        misses: stats.stats.keyspaceMisses,
      })
    }
  }
  
  // Initial check
  logStats()
  
  // Set up interval
  return setInterval(logStats, intervalMs)
}

// Clean up expired keys
export async function cleanupExpiredKeys(): Promise<number> {
  // Redis automatically removes expired keys, but we can force cleanup
  const info = await getRedisInfo()
  const keyspace = info.keyspace || {}
  
  let cleanedCount = 0
  
  for (const [dbName, dbInfo] of Object.entries(keyspace)) {
    if (dbName.startsWith("db")) {
      const dbIndex = parseInt(dbName.substring(2))
      await redis.select(dbIndex)
      
      // Force cleanup by accessing random keys
      const keys = await redis.randomkey()
      if (keys) {
        await redis.ttl(keys)
        cleanedCount++
      }
    }
  }
  
  // Switch back to default database
  await redis.select(0)
  
  return cleanedCount
}

// Get slow log entries
export async function getSlowLog(count: number = 10): Promise<any[]> {
  const slowLog = await redis.slowlog("GET", count)
  
  return slowLog.map((entry: any) => ({
    id: entry[0],
    timestamp: new Date(entry[1] * 1000),
    duration: entry[2],
    command: entry[3].join(" "),
    clientInfo: entry[4],
  }))
}
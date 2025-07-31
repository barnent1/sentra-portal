import { db } from "./db"
import { sql } from "drizzle-orm"

// Database monitoring utilities for connection pool health

export interface ConnectionPoolStats {
  active: number
  idle: number
  total: number
  waiting: number
  maxConnections: number
}

export interface DatabaseHealth {
  isHealthy: boolean
  latency: number
  error?: string
}

// Monitor connection pool statistics (PostgreSQL only)
export async function getConnectionPoolStats(): Promise<ConnectionPoolStats | null> {
  if (process.env.DATABASE_URL?.startsWith("file:")) {
    // SQLite doesn't have connection pooling
    return null
  }

  try {
    // This is a PostgreSQL-specific query
    const result = await db.execute<any>(sql`
      SELECT 
        numbackends as active,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
      FROM pg_stat_database 
      WHERE datname = current_database()
    `)

    if (result.rows && result.rows.length > 0) {
      const stats = result.rows[0]
      const maxConnections = stats.max_connections
      const active = stats.active

      return {
        active,
        idle: 0, // Would need pg_stat_activity for accurate idle count
        total: active,
        waiting: 0, // Would need additional monitoring for wait queue
        maxConnections,
      }
    }
  } catch (error) {
    console.error("Error fetching connection pool stats:", error)
  }

  return null
}

// Check database health with a simple query
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startTime = Date.now()

  try {
    // Simple health check query
    await db.execute(sql`SELECT 1`)
    
    const latency = Date.now() - startTime
    
    return {
      isHealthy: true,
      latency,
    }
  } catch (error) {
    return {
      isHealthy: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Monitor and log connection pool metrics
export async function monitorConnectionPool(intervalMs: number = 60000): Promise<NodeJS.Timer> {
  const logMetrics = async () => {
    const stats = await getConnectionPoolStats()
    const health = await checkDatabaseHealth()

    console.log("Database Metrics:", {
      timestamp: new Date().toISOString(),
      health: health.isHealthy ? "healthy" : "unhealthy",
      latency: `${health.latency}ms`,
      connectionPool: stats,
      error: health.error,
    })

    // Alert if connection pool is near capacity
    if (stats && stats.active / stats.maxConnections > 0.8) {
      console.warn("WARNING: Connection pool usage above 80%", {
        active: stats.active,
        max: stats.maxConnections,
        usage: `${Math.round((stats.active / stats.maxConnections) * 100)}%`,
      })
    }
  }

  // Initial check
  logMetrics()

  // Set up interval
  return setInterval(logMetrics, intervalMs)
}
// Database configuration with connection pooling settings

export const dbConfig = {
  // PostgreSQL connection pooling parameters
  postgresql: {
    // Maximum number of connections in the pool
    connectionLimit: parseInt(process.env.DB_POOL_SIZE || "10"),
    
    // Connection timeout in milliseconds
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || "5000"),
    
    // Idle timeout in milliseconds
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "10000"),
    
    // Maximum connection lifetime in milliseconds
    maxLifetimeMillis: parseInt(process.env.DB_MAX_LIFETIME || "1800000"), // 30 minutes
    
    // Statement timeout in milliseconds
    statementTimeoutMillis: parseInt(process.env.DB_STATEMENT_TIMEOUT || "30000"),
  },
  
  // Prisma-specific settings
  prisma: {
    // Query timeout in milliseconds
    queryTimeout: parseInt(process.env.PRISMA_QUERY_TIMEOUT || "30000"),
    
    // Connection pool size (for Prisma's internal pool)
    connectionLimit: parseInt(process.env.PRISMA_CONNECTION_LIMIT || "10"),
  },
}

// Helper function to build PostgreSQL connection URL with pooling parameters
export function buildPostgreSQLUrl(baseUrl: string): string {
  const url = new URL(baseUrl)
  
  // Add connection pooling parameters
  url.searchParams.set("connection_limit", dbConfig.postgresql.connectionLimit.toString())
  url.searchParams.set("connect_timeout", (dbConfig.postgresql.connectionTimeoutMillis / 1000).toString())
  url.searchParams.set("pool_timeout", (dbConfig.postgresql.idleTimeoutMillis / 1000).toString())
  url.searchParams.set("socket_timeout", (dbConfig.postgresql.statementTimeoutMillis / 1000).toString())
  
  // Add SSL mode for production
  if (process.env.NODE_ENV === "production" && !url.searchParams.has("sslmode")) {
    url.searchParams.set("sslmode", "require")
  }
  
  return url.toString()
}

// Example connection URLs with pooling:
// Development (SQLite): file:./dev.db
// Production (PostgreSQL): postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=10
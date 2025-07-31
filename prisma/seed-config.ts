// Seed configuration for different environments

export interface SeedConfig {
  users: {
    admin: number
    regular: number
    unverified: number
  }
  projects: {
    perUser: number
    suspended: number
  }
  apiKeys: {
    perProject: number
    expired: number
  }
  auditLogs: {
    perUser: number
    perProject: number
  }
}

export const seedConfigs: Record<string, SeedConfig> = {
  // Minimal seed for CI/CD
  minimal: {
    users: {
      admin: 1,
      regular: 1,
      unverified: 0,
    },
    projects: {
      perUser: 1,
      suspended: 0,
    },
    apiKeys: {
      perProject: 1,
      expired: 0,
    },
    auditLogs: {
      perUser: 2,
      perProject: 1,
    },
  },
  
  // Development seed with moderate data
  development: {
    users: {
      admin: 1,
      regular: 3,
      unverified: 1,
    },
    projects: {
      perUser: 2,
      suspended: 1,
    },
    apiKeys: {
      perProject: 2,
      expired: 1,
    },
    auditLogs: {
      perUser: 5,
      perProject: 3,
    },
  },
  
  // Large seed for performance testing
  performance: {
    users: {
      admin: 2,
      regular: 100,
      unverified: 20,
    },
    projects: {
      perUser: 5,
      suspended: 10,
    },
    apiKeys: {
      perProject: 3,
      expired: 5,
    },
    auditLogs: {
      perUser: 50,
      perProject: 20,
    },
  },
}

// Get seed configuration based on environment or argument
export function getSeedConfig(): SeedConfig {
  const seedType = process.env.SEED_TYPE || process.argv[2] || "development"
  
  if (!(seedType in seedConfigs)) {
    console.warn(`Unknown seed type: ${seedType}, using development config`)
    return seedConfigs.development
  }
  
  console.log(`Using seed configuration: ${seedType}`)
  return seedConfigs[seedType]
}
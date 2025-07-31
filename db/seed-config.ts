// Seed configuration
export const seedConfig = {
  // Number of users to create
  users: {
    count: 10,
    // Include a test admin user
    includeAdmin: true,
    adminEmail: "admin@example.com",
    adminPassword: "Admin123!",
  },
  
  // Number of projects per user
  projectsPerUser: {
    min: 1,
    max: 3,
  },
  
  // Number of API keys per project
  apiKeysPerProject: {
    min: 1,
    max: 2,
  },
  
  // Number of audit logs to generate
  auditLogs: {
    count: 50,
  },
  
  // Test user credentials
  testUser: {
    email: "test@example.com",
    password: "Test123!",
    name: "Test User",
  },
};
import { db } from "@/lib/db";
import { users, projects, apiKeys, auditLogs, type NewUser, type NewProject, type NewApiKey, type NewAuditLog } from "@/db/schema";
import { seedConfig } from "./seed-config";
import { hashPassword } from "@/lib/auth-utils";
import crypto from "crypto";

// Generate a random string
function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

// Generate a slug from a name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await db.delete(auditLogs);
    await db.delete(apiKeys);
    await db.delete(projects);
    await db.delete(users);

    // Create admin user
    if (seedConfig.users.includeAdmin) {
      console.log("Creating admin user...");
      const adminPassword = await hashPassword(seedConfig.users.adminPassword);
      const adminUser: NewUser = {
        id: crypto.randomUUID(),
        email: seedConfig.users.adminEmail,
        password: adminPassword,
        name: "Admin User",
        role: "ADMIN",
        emailVerified: new Date(),
      };
      await db.insert(users).values(adminUser);
    }

    // Create test user
    console.log("Creating test user...");
    const testPassword = await hashPassword(seedConfig.testUser.password);
    const testUser: NewUser = {
      id: crypto.randomUUID(),
      email: seedConfig.testUser.email,
      password: testPassword,
      name: seedConfig.testUser.name,
      role: "USER",
      emailVerified: new Date(),
    };
    await db.insert(users).values(testUser);

    // Create additional users
    const userList: NewUser[] = [];
    for (let i = 1; i <= seedConfig.users.count; i++) {
      const user: NewUser = {
        id: crypto.randomUUID(),
        email: `user${i}@example.com`,
        password: await hashPassword("Password123!"),
        name: `User ${i}`,
        role: "USER",
        emailVerified: Math.random() > 0.3 ? new Date() : null,
      };
      userList.push(user);
    }
    
    console.log(`Creating ${userList.length} users...`);
    await db.insert(users).values(userList);

    // Get all created users
    const allUsers = await db.select().from(users);
    
    // Create projects for each user
    console.log("Creating projects...");
    const projectList: NewProject[] = [];
    const projectIds: { [key: string]: string[] } = {};

    for (const user of allUsers) {
      const projectCount = Math.floor(
        Math.random() * (seedConfig.projectsPerUser.max - seedConfig.projectsPerUser.min + 1) +
          seedConfig.projectsPerUser.min
      );

      projectIds[user.id] = [];

      for (let i = 0; i < projectCount; i++) {
        const projectName = `${user.name}'s Project ${i + 1}`;
        const project: NewProject = {
          id: crypto.randomUUID(),
          name: projectName,
          description: `Description for ${projectName}`,
          slug: `${generateSlug(user.name || "user")}-project-${i + 1}-${generateRandomString(6)}`,
          ownerId: user.id,
          status: Math.random() > 0.9 ? "SUSPENDED" : "ACTIVE",
          metadata: JSON.stringify({ category: ["web", "mobile", "api"][Math.floor(Math.random() * 3)] }),
        };
        projectList.push(project);
        projectIds[user.id].push(project.id);
      }
    }

    await db.insert(projects).values(projectList);

    // Create API keys for each project
    console.log("Creating API keys...");
    const apiKeyList: NewApiKey[] = [];

    for (const projectId of Object.values(projectIds).flat()) {
      const apiKeyCount = Math.floor(
        Math.random() * (seedConfig.apiKeysPerProject.max - seedConfig.apiKeysPerProject.min + 1) +
          seedConfig.apiKeysPerProject.min
      );

      for (let i = 0; i < apiKeyCount; i++) {
        const apiKey: NewApiKey = {
          id: crypto.randomUUID(),
          key: `sk_${generateRandomString(32)}`,
          name: `API Key ${i + 1}`,
          projectId: projectId,
          scopes: JSON.stringify(["read", "write"].slice(0, Math.floor(Math.random() * 2) + 1)),
          rateLimit: [100, 500, 1000, 5000][Math.floor(Math.random() * 4)],
          isActive: Math.random() > 0.1,
          expiresAt: Math.random() > 0.5 ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
        };
        apiKeyList.push(apiKey);
      }
    }

    await db.insert(apiKeys).values(apiKeyList);

    // Create audit logs
    console.log("Creating audit logs...");
    const auditLogList: NewAuditLog[] = [];
    const actions = ["user.login", "user.logout", "project.create", "project.update", "apikey.create", "apikey.use"];
    const entityTypes = ["user", "project", "apikey"];

    for (let i = 0; i < seedConfig.auditLogs.count; i++) {
      const userId = allUsers[Math.floor(Math.random() * allUsers.length)].id;
      const userProjects = projectIds[userId] || [];
      const projectId = userProjects.length > 0 ? userProjects[Math.floor(Math.random() * userProjects.length)] : null;

      const auditLog: NewAuditLog = {
        id: crypto.randomUUID(),
        action: actions[Math.floor(Math.random() * actions.length)],
        entityType: entityTypes[Math.floor(Math.random() * entityTypes.length)],
        entityId: crypto.randomUUID(),
        userId: Math.random() > 0.2 ? userId : null,
        projectId: Math.random() > 0.5 ? projectId : null,
        metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      };
      auditLogList.push(auditLog);
    }

    await db.insert(auditLogs).values(auditLogList);

    console.log("✅ Seed completed successfully!");
    console.log(`
    Summary:
    - Users: ${allUsers.length}
    - Projects: ${projectList.length}
    - API Keys: ${apiKeyList.length}
    - Audit Logs: ${auditLogList.length}
    `);

  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

// Run the seed
main();
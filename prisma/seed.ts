import { PrismaClient, UserRole, ProjectStatus } from "@prisma/client"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

const prisma = new PrismaClient()

// Helper function to generate API keys
function generateApiKey(): string {
  return `sk_${randomBytes(32).toString("hex")}`
}

// Helper function to generate slugs
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function main() {
  console.log("🌱 Starting database seeding...")

  // Clean existing data
  console.log("🧹 Cleaning existing data...")
  await prisma.auditLog.deleteMany()
  await prisma.apiKey.deleteMany()
  await prisma.project.deleteMany()
  await prisma.passwordReset.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  console.log("👤 Creating users...")
  
  const adminPassword = await bcrypt.hash("admin123", 10)
  const userPassword = await bcrypt.hash("user123", 10)

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin User",
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  })

  const testUser1 = await prisma.user.create({
    data: {
      email: "john.doe@example.com",
      password: userPassword,
      name: "John Doe",
      role: UserRole.USER,
      emailVerified: new Date(),
    },
  })

  const testUser2 = await prisma.user.create({
    data: {
      email: "jane.smith@example.com",
      password: userPassword,
      name: "Jane Smith",
      role: UserRole.USER,
      emailVerified: new Date(),
    },
  })

  const unverifiedUser = await prisma.user.create({
    data: {
      email: "unverified@example.com",
      password: userPassword,
      name: "Unverified User",
      role: UserRole.USER,
      emailVerified: null,
    },
  })

  console.log("✅ Users created")

  // Create projects
  console.log("📁 Creating projects...")

  const project1 = await prisma.project.create({
    data: {
      name: "My First Project",
      slug: generateSlug("My First Project"),
      description: "This is a test project for development",
      ownerId: testUser1.id,
      status: ProjectStatus.ACTIVE,
      metadata: JSON.stringify({
        category: "web",
        tags: ["nextjs", "typescript"],
      }),
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name: "E-commerce API",
      slug: generateSlug("E-commerce API"),
      description: "RESTful API for e-commerce platform",
      ownerId: testUser1.id,
      status: ProjectStatus.ACTIVE,
      metadata: JSON.stringify({
        category: "api",
        tags: ["rest", "commerce"],
      }),
    },
  })

  const project3 = await prisma.project.create({
    data: {
      name: "Analytics Dashboard",
      slug: generateSlug("Analytics Dashboard"),
      description: "Real-time analytics dashboard",
      ownerId: testUser2.id,
      status: ProjectStatus.ACTIVE,
      metadata: JSON.stringify({
        category: "dashboard",
        tags: ["analytics", "realtime"],
      }),
    },
  })

  const suspendedProject = await prisma.project.create({
    data: {
      name: "Suspended Project",
      slug: generateSlug("Suspended Project"),
      description: "This project has been suspended",
      ownerId: testUser2.id,
      status: ProjectStatus.SUSPENDED,
    },
  })

  console.log("✅ Projects created")

  // Create API keys
  console.log("🔑 Creating API keys...")

  const apiKey1 = await prisma.apiKey.create({
    data: {
      key: generateApiKey(),
      name: "Development Key",
      projectId: project1.id,
      scopes: JSON.stringify(["read", "write"]),
      rateLimit: 1000,
      isActive: true,
    },
  })

  const apiKey2 = await prisma.apiKey.create({
    data: {
      key: generateApiKey(),
      name: "Production Key",
      projectId: project1.id,
      scopes: JSON.stringify(["read"]),
      rateLimit: 5000,
      isActive: true,
      lastUsedAt: new Date(),
    },
  })

  const apiKey3 = await prisma.apiKey.create({
    data: {
      key: generateApiKey(),
      name: "Test Key",
      projectId: project2.id,
      scopes: JSON.stringify(["read", "write", "delete"]),
      rateLimit: 100,
      isActive: true,
    },
  })

  const expiredKey = await prisma.apiKey.create({
    data: {
      key: generateApiKey(),
      name: "Expired Key",
      projectId: project3.id,
      scopes: JSON.stringify(["read"]),
      rateLimit: 1000,
      isActive: false,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired yesterday
    },
  })

  console.log("✅ API keys created")

  // Create audit logs
  console.log("📝 Creating audit logs...")

  const auditLogs = [
    {
      action: "user.login",
      entityType: "user",
      entityId: testUser1.id,
      userId: testUser1.id,
      metadata: JSON.stringify({
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      }),
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
    },
    {
      action: "project.create",
      entityType: "project",
      entityId: project1.id,
      userId: testUser1.id,
      projectId: project1.id,
      metadata: JSON.stringify({
        projectName: project1.name,
      }),
    },
    {
      action: "apikey.create",
      entityType: "apikey",
      entityId: apiKey1.id,
      userId: testUser1.id,
      projectId: project1.id,
      metadata: JSON.stringify({
        keyName: apiKey1.name,
      }),
    },
    {
      action: "apikey.use",
      entityType: "apikey",
      entityId: apiKey2.id,
      apiKeyId: apiKey2.id,
      projectId: project1.id,
      metadata: JSON.stringify({
        endpoint: "/api/data",
        method: "GET",
        statusCode: 200,
      }),
      ipAddress: "203.0.113.45",
      userAgent: "axios/1.0",
    },
  ]

  for (const log of auditLogs) {
    await prisma.auditLog.create({ data: log })
  }

  console.log("✅ Audit logs created")

  // Display summary
  console.log("\n📊 Seeding Summary:")
  console.log("------------------")
  console.log(`✅ ${await prisma.user.count()} users created`)
  console.log(`✅ ${await prisma.project.count()} projects created`)
  console.log(`✅ ${await prisma.apiKey.count()} API keys created`)
  console.log(`✅ ${await prisma.auditLog.count()} audit logs created`)
  
  console.log("\n🔐 Test Credentials:")
  console.log("-------------------")
  console.log("Admin: admin@example.com / admin123")
  console.log("User 1: john.doe@example.com / user123")
  console.log("User 2: jane.smith@example.com / user123")
  console.log("Unverified: unverified@example.com / user123")
  
  console.log("\n🔑 Sample API Keys:")
  console.log("------------------")
  const sampleKeys = await prisma.apiKey.findMany({ take: 3 })
  for (const key of sampleKeys) {
    console.log(`${key.name}: ${key.key}`)
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
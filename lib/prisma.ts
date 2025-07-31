import { PrismaClient } from "@prisma/client"

// Declare global prisma instance
declare global {
  var prisma: PrismaClient | undefined
}

// Configure Prisma Client options based on environment
const prismaClientOptions = {
  log: process.env.NODE_ENV === "development" 
    ? ["query", "error", "warn"] 
    : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}

// Create Prisma Client instance with connection pooling
// In production, connection pooling is handled by the database connection string
export const prisma = global.prisma || new PrismaClient(prismaClientOptions)

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

// Graceful shutdown
if (process.env.NODE_ENV === "production") {
  process.on("SIGTERM", async () => {
    await prisma.$disconnect()
  })
}
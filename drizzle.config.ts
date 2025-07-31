import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: process.env.NODE_ENV === "production" ? "postgresql" : "sqlite",
  dbCredentials: {
    ...(process.env.NODE_ENV === "production"
      ? {
          url: process.env.DATABASE_URL!,
        }
      : {
          url: process.env.DATABASE_URL || "./db/dev.db",
        }),
  },
  verbose: true,
  strict: true,
});
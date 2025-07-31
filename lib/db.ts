import { drizzle } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import Database from "better-sqlite3";
import postgres from "postgres";
import * as schema from "@/db/schema";

// Declare global db instance
declare global {
  var db: ReturnType<typeof drizzle> | ReturnType<typeof drizzlePg> | undefined;
}

let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzlePg>;

if (process.env.NODE_ENV === "production") {
  // PostgreSQL for production
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString, {
    prepare: false,
    max: 10, // Connection pool size
  });
  
  db = global.db || drizzlePg(client, { schema });
  
  if (process.env.NODE_ENV !== "production") {
    global.db = db;
  }
} else {
  // SQLite for development
  const sqlite = new Database(process.env.DATABASE_URL || "./db/dev.db");
  db = global.db || drizzle(sqlite, { schema });
  
  if (process.env.NODE_ENV !== "production") {
    global.db = db;
  }
}

export { db };

// Type exports for better TypeScript support
export type DbClient = typeof db;
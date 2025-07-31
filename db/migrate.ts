import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { migrate as migratePg } from "drizzle-orm/postgres-js/migrator";
import { db } from "@/lib/db";
import path from "path";

async function runMigrations() {
  console.log("Running database migrations...");

  try {
    if (process.env.NODE_ENV === "production") {
      // PostgreSQL migrations
      await migratePg(db as any, {
        migrationsFolder: path.join(process.cwd(), "db/migrations"),
      });
    } else {
      // SQLite migrations
      await migrate(db as any, {
        migrationsFolder: path.join(process.cwd(), "db/migrations"),
      });
    }

    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}
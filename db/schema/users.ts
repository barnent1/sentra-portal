import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";
import { userRoleEnum } from "./enums";
import { accounts } from "./accounts";
import { sessions } from "./sessions";
import { passwordResets } from "./password-resets";
import { projects } from "./projects";
import { auditLogs } from "./audit-logs";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique().notNull(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  password: text("password"),
  name: text("name"),
  image: text("image"),
  role: text("role", { enum: userRoleEnum }).default("USER").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull()
    .$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  passwordResets: many(passwordResets),
  projects: many(projects),
  auditLogs: many(auditLogs),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
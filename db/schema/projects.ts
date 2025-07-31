import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";
import { projectStatusEnum } from "./enums";
import { users } from "./users";
import { apiKeys } from "./api-keys";
import { auditLogs } from "./audit-logs";

export const projects = sqliteTable(
  "projects",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    description: text("description"),
    slug: text("slug").unique().notNull(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", { enum: projectStatusEnum })
      .default("ACTIVE")
      .notNull(),
    metadata: text("metadata"), // JSON string for SQLite
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    ownerIdIdx: index("owner_id_idx").on(table.ownerId),
    slugIdx: index("slug_idx").on(table.slug),
  })
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  apiKeys: many(apiKeys),
  auditLogs: many(auditLogs),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
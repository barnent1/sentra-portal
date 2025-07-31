import { pgEnum, sqliteText } from "drizzle-orm/sqlite-core";

// User roles enum
export const userRoleEnum = ["USER", "ADMIN"] as const;
export type UserRole = (typeof userRoleEnum)[number];

// Project status enum
export const projectStatusEnum = ["ACTIVE", "SUSPENDED", "ARCHIVED"] as const;
export type ProjectStatus = (typeof projectStatusEnum)[number];

// For PostgreSQL, we would use pgEnum
// export const userRolePgEnum = pgEnum("user_role", userRoleEnum);
// export const projectStatusPgEnum = pgEnum("project_status", projectStatusEnum);
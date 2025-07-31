import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").unique().notNull(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    identifierTokenIdx: uniqueIndex("identifier_token_idx").on(
      table.identifier,
      table.token
    ),
  })
);

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
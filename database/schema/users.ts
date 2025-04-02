import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Table representing users in the application
 */
export const users = sqliteTable("users", {
  /** Unique identifier for the user */
  id: text("id").primaryKey(),
  /** Display name of the user */
  name: text("name").notNull(),
  /** URL or path to the user's avatar image */
  avatar: text("avatar").notNull(),
  /** Current status of the user */
  status: text("status", { enum: ["online", "offline", "away"] }).notNull(),
});
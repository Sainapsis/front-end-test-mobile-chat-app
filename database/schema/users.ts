import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { UserStatus } from '../interface/user';

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull(),
  status: text("status", { enum: [UserStatus.ONLINE, UserStatus.OFFLINE, UserStatus.AWAY] }).notNull(),
}); 
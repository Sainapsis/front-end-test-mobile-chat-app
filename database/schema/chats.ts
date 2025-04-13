import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const chats = sqliteTable("chats", {
  id: text("id").primaryKey(),
});

export const chatParticipants = sqliteTable("chat_participants", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull().references(() => chats.id),
  userId: text("user_id").notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull().references(() => chats.id),
  senderId: text("sender_id").notNull(),
  text: text("text").notNull(),
  timestamp: integer("timestamp").notNull(),
  // Added columns for message status and reactions
  status: text("status").notNull().default("sent"),
  readBy: text("read_by").default("[]").$type<string[]>(),
  reaction: text("reaction"),
  // Added columns for deleted and edited status and 0 = false, 1 = true
  isDeleted: integer("is_deleted").notNull().default(0), 
  editedAt: integer("edited_at"),
});
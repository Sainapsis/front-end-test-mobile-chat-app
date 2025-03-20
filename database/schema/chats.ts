import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const chats = sqliteTable("chats", {
  id: text("id").primaryKey(),
});

export const chatParticipants = sqliteTable("chat_participants", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull().references(() => chats.id),
  userId: text("user_id").notNull(),
  unreadedMessages: integer("unreaded_messages").notNull().default(0)
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull().references(() => chats.id),
  senderId: text("sender_id").notNull(),
  text: text("text").notNull(),
  timestamp: integer("timestamp").notNull(),
});

export const messagesReadBy = sqliteTable("messages_read_by", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull().references(() => messages.id),
  userId: text("user_id").notNull(),
  readed: integer("readed", { mode: "boolean" }).default(false)
})
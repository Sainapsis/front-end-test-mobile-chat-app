import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const chats = sqliteTable("chats", {
  id: text("id").primaryKey(),
});

export const chatParticipants = sqliteTable("chat_participants", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull(),
  userId: text("user_id").notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull(),
  senderId: text("sender_id").notNull(),
  text: text("text").notNull(),
  timestamp: integer("timestamp").notNull(),
  editedAt: integer("edited_at"),
});

export const chatParticipantsHistory = sqliteTable("chat_participants_history", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull(),
  userId: text("user_id").notNull(),
  leftAt: integer("left_at").notNull(),
});

export const deletedMessages = sqliteTable("deleted_messages", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull(),
  userId: text("user_id").notNull(),
  chatId: text("chat_id").notNull(),
  deletedAt: integer("deleted_at").notNull(),
});

export const messageReactions = sqliteTable("message_reactions", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull(),
  userId: text("user_id").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: integer("created_at").notNull(),
});

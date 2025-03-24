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
  messageType: text("message_type").notNull().default("text"),
  imageUri: text("image_uri"),
  imagePreviewUri: text("image_preview_uri"),
  status: text("status").notNull().default("sent"),
});

export const messageReadReceipts = sqliteTable("message_read_receipts", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull().references(() => messages.id),
  userId: text("user_id").notNull(),
  timestamp: integer("timestamp").notNull(),
}); 
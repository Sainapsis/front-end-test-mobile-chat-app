import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Table representing chat rooms
 */
export const chats = sqliteTable("chats", {
  id: text("id").primaryKey(),
});

/**
 * Table representing participants in chat rooms
 */
export const chatParticipants = sqliteTable("chat_participants", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull(),
  userId: text("user_id").notNull(),
});

/**
 * Table representing messages in chat rooms
 */
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull(),
  senderId: text("sender_id").notNull(),
  text: text("text"),
  timestamp: integer("timestamp").notNull(),
  editedAt: integer("edited_at"),
  hasMultimedia: integer("has_multimedia").default(0),
  multimediaType: text("multimedia_type"),
  multimediaUrl: text("multimedia_url"),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"),
  size: integer("size"),
});

/**
 * Table tracking historical participation in chat rooms
 */
export const chatParticipantsHistory = sqliteTable("chat_participants_history", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull(),
  userId: text("user_id").notNull(),
  leftAt: integer("left_at").notNull(),
});

/**
 * Table tracking deleted messages
 */
export const deletedMessages = sqliteTable("deleted_messages", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull(),
  userId: text("user_id").notNull(),
  chatId: text("chat_id").notNull(),
  deletedAt: integer("deleted_at").notNull(),
});

/**
 * Table representing reactions to messages
 */
export const messageReactions = sqliteTable("message_reactions", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull(),
  userId: text("user_id").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: integer("created_at").notNull(),
});

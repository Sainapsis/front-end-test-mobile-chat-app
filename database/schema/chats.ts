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
  text: text("text"),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"),
  mediaThumbnail: text("media_thumbnail"),
  timestamp: integer("timestamp").notNull(),
  status: text("status", { enum: ['sent', 'delivered', 'read'] }).notNull().default("sent"),
  isEdited: integer("is_edited").notNull().default(0),
  editedAt: integer("edited_at"),
  voiceUrl: text("voice_url"),
  voiceDuration: integer("voice_duration"),
  isVoiceMessage: integer("is_voice_message").notNull().default(0),
});

export const messageReactions = sqliteTable("message_reactions", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull().references(() => messages.id),
  userId: text("user_id").notNull(),
  emoji: text("emoji").notNull(),
  timestamp: integer("timestamp").notNull(),
}); 
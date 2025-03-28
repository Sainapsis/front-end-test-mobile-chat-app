import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const chats = sqliteTable("chats", {
  id: text("id").primaryKey(),
  lastMessage: text("last_message"),
  chatName: text("chat_name").notNull(),
  lastMessageTime: integer("last_message_time"),
  unreadedMessages: integer("unread_messages"),
  lastMessageSender: text("last_message_sender"),
  lastMessageSenderId: text("last_message_sender_id"),
  chatStatus: text("chat_status"),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull().references(() => chats.id),
  senderId: text("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  text: text("text"),
  timestamp: integer("timestamp").notNull(),
  responseText: text("response_text"),
  responseTo: text("response_to"),
  responseId: text("response_id"),
  mediaUri: text("media_uri"),
  readed: integer("readed")
});
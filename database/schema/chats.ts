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
  status: text("status").notNull().default("sent"), // sent, delivered, read
  mediaType: text("media_type", { enum: ["image", "video", "audio", "file"] }), // image, video, audio, file
  mediaUrl: text("media_url"), // URL del archivo multimedia
  mediaSize: integer("media_size"), // Tamaño del archivo en bytes
  mediaName: text("media_name"), // Nombre original del archivo
});
  // para que se pueda ver el mensaje cuando se marca como leído
export const messageReads = sqliteTable("message_reads", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull().references(() => messages.id),
  userId: text("user_id").notNull(),
  timestamp: integer("timestamp").notNull(),
}); 
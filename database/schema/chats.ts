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
  status: text("status", { enum: ["sent", "read"] }).notNull().default("sent"),
  readBy: text("read_by").notNull().default("[]"), // JSON array of user IDs
  isEdited: integer("is_edited", { mode: "boolean" }).notNull().default(false),
  isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
  editedAt: integer("edited_at"),
  deletedAt: integer("deleted_at"),
  originalText: text("original_text"), // Para mantener el texto original en caso de edición
}); 
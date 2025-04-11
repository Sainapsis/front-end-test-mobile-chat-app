import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    avatar: text('avatar').notNull(),
    status: text('status').notNull().default('offline'),
});

export const chats = sqliteTable('chats', {
    id: text('id').primaryKey(),
});

export const chatParticipants = sqliteTable('chat_participants', {
    id: text('id').primaryKey(),
    chatId: text('chat_id').notNull().references(() => chats.id),
    userId: text('user_id').notNull().references(() => users.id),
});

export const messages = sqliteTable('messages', {
    id: text('id').primaryKey(),
    chatId: text('chat_id').notNull().references(() => chats.id),
    senderId: text('sender_id').notNull().references(() => users.id),
    text: text('text').notNull(),
    imageUrl: text('image_url'),
    voiceUrl: text('voice_url'),
    messageType: text('message_type').notNull().default('text'),
    isRead: integer('is_read').notNull().default(0),
    deliveryStatus: text('delivery_status').notNull().default('sending'),
    reactions: text('reactions'),
    timestamp: integer('timestamp').notNull(),
}); 
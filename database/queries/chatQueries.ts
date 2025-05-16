import { db } from '../db';
import { chats as chatsSchema, chatParticipants, messages } from '../schema';
import { eq, sql, asc, desc } from 'drizzle-orm';

export const getUserChatsWithDetails = async (userId: string) => {
  // Subquery para obtener el último mensaje de cada chat
  const lastMessages = db
    .select({
      chatId: messages.chatId,
      messageId: messages.id,
      senderId: messages.senderId,
      text: messages.text,
      timestamp: messages.timestamp,
      status: messages.status,
      readBy: messages.readBy,
      isEdited: messages.isEdited,
      isDeleted: messages.isDeleted,
      editedAt: messages.editedAt,
      deletedAt: messages.deletedAt,
      originalText: messages.originalText,
    })
    .from(messages)
    .innerJoin(
      db
        .select({
          chat_id: messages.chatId,
          max_timestamp: sql<number>`MAX(${messages.timestamp}) as max_timestamp`
        })
        .from(messages)
        .groupBy(messages.chatId)
        .as('lm'),
      sql`lm.chat_id = ${messages.chatId} AND lm.max_timestamp = ${messages.timestamp}`
    )
    .as('last_messages');

  // Query principal que obtiene chats, participantes y último mensaje
  const chats = await db
    .select({
      id: chatsSchema.id,
      participants: sql<string>`GROUP_CONCAT(DISTINCT ${chatParticipants.userId})`,
      lastMessage: sql<{
        id: string;
        chatId: string;
        senderId: string;
        text: string;
        timestamp: number;
        status: string;
        readBy: string;
        isEdited: boolean;
        isDeleted: boolean;
        editedAt: string | null;
        deletedAt: string | null;
        originalText: string | null;
      }>`json_object(
        'id', ${lastMessages.messageId},
        'chatId', ${lastMessages.chatId},
        'senderId', ${lastMessages.senderId},
        'text', ${lastMessages.text},
        'timestamp', ${lastMessages.timestamp},
        'status', ${lastMessages.status},
        'readBy', ${lastMessages.readBy},
        'isEdited', ${lastMessages.isEdited},
        'isDeleted', ${lastMessages.isDeleted},
        'editedAt', ${lastMessages.editedAt},
        'deletedAt', ${lastMessages.deletedAt},
        'originalText', ${lastMessages.originalText}
      )`,
    })
    .from(chatsSchema)
    .innerJoin(
      chatParticipants,
      eq(chatParticipants.chatId, chatsSchema.id)
    )
    .leftJoin(
      lastMessages,
      eq(lastMessages.chatId, chatsSchema.id)
    )
    .where(
      sql`${chatsSchema.id} IN (
        SELECT ${chatParticipants.chatId}
        FROM ${chatParticipants}
        WHERE ${chatParticipants.userId} = ${userId}
      )`
    )
    .groupBy(chatsSchema.id, lastMessages.chatId);

  return chats;
}; 
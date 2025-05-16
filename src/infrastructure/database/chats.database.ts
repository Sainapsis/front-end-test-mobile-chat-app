import { ChatsDataParams, ChatsDataResponse, CreateChatParams, MessageDataParams, ParticipantDataResponse, ParticipantRowsParams, ParticipantRowsParamsResponse } from '@/src/data/interfaces/chats.interface';
import { Message } from '@/src/domain/entities/message';
import { db } from "@/src/infrastructure/queries/db";
import { chatParticipants, chats, messages } from "@/src/infrastructure/schema";
import { desc, eq } from "drizzle-orm";

export const createChatDB = async ({
  chatId,
  participantIds,
}: CreateChatParams): Promise<void> => {
  await db.insert(chats).values({ id: chatId });

  for (const userId of participantIds) {
    await db.insert(chatParticipants).values({
      id: `cp-${chatId}-${userId}`,
      chatId: chatId,
      userId: userId,
    });
  }
};

export const participantRowsDB = async ({
  currentUserId,
}: ParticipantRowsParams): Promise<ParticipantRowsParamsResponse[]> => {
  const participantRows = await db
    .select()
    .from(chatParticipants)
    .where(eq(chatParticipants.userId, currentUserId));

  return participantRows;
};

export const chatsDataDB = async ({
  chatId,
}: ChatsDataParams): Promise<ChatsDataResponse[]> => {
  const chatData = await db.select().from(chats).where(eq(chats.id, chatId));

  return chatData;
};

export const participantDataDB = async ({
  chatId,
}: ChatsDataParams): Promise<ParticipantDataResponse[]> => {
  const participantData = await db
    .select()
    .from(chatParticipants)
    .where(eq(chatParticipants.chatId, chatId));

  return participantData;
};

export const messagesDataDB = async ({
  chatId,
}: MessageDataParams): Promise<Message[]> => {
  const messageDatatData = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(desc(messages.timestamp));

  return messageDatatData as Message[];
};

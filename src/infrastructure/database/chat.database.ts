import { db } from "@/src/infrastructure/queries/db";
import { chatParticipants, chats, messages } from "@/src/infrastructure/schema";
import {
  ChatDataParams,
  ChatDataResponse,
  CreateChatParams,
  MessageDataParams,
  ParticipantDataResponse,
  ParticipantRowsParams,
  ParticipantRowsParamsResponse,
  SendMessageParams,
  UpdateStatusMessageParams,
} from "@/src/data/interfaces/chat.interface";
import { and, desc, eq } from "drizzle-orm";
import { Message, MessageStatus } from "@/src/domain/entities/message";
import { Chat } from "@/src/domain/entities/chat";

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

export const sendMessageDB = async ({
  chatId,
  message,
}: SendMessageParams): Promise<void> => {
  await db.insert(messages).values({
    id: message.id,
    chatId: chatId,
    senderId: message.senderId,
    text: message.text,
    imageUri: message.imageUri,
    timestamp: message.timestamp,
    status: message.status,
  });
};

export const updateStatusMessageDB = async ({
  messageId,
  status,
}: UpdateStatusMessageParams): Promise<void> => {
  await db.update(messages).set({ status }).where(eq(messages.id, messageId));
};

export const deleteMessageDB = async ({
  messageId,
}: {
  messageId: string;
}): Promise<void> => {
  await db.delete(messages).where(eq(messages.id, messageId));
};

export const editMessageDB = async ({
  messageId,
  newText,
}: {
  messageId: string;
  newText: string;
}): Promise<void> => {
  await db
    .update(messages)
    .set({ text: newText })
    .where(eq(messages.id, messageId));
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

export const chatDataDB = async ({
  chatId,
}: ChatDataParams): Promise<ChatDataResponse[]> => {
  const chatData = await db.select().from(chats).where(eq(chats.id, chatId));

  return chatData;
};

export const participantDataDB = async ({
  chatId,
}: ChatDataParams): Promise<ParticipantDataResponse[]> => {
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

export const getChatByIDDB = async ({
  chatId,
  currentUserId,
}: {
  chatId: string;
  currentUserId: string;
}): Promise<Chat> => {
  const chatsData = await db
    .select({
      chatId: chats.id,
      participantId: chatParticipants.userId,
      messageId: messages.id,
      senderId: messages.senderId,
      text: messages.text,
      imageUri: messages.imageUri,
      timestamp: messages.timestamp,
      status: messages.status,
    })
    .from(chats)
    .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
    .innerJoin(messages, eq(chats.id, messages.chatId))
    .where(
      and(eq(chatParticipants.userId, currentUserId), eq(chats.id, chatId))
    )
    .orderBy(desc(messages.timestamp));

  const chat: Chat = {
    id: chatsData[0].chatId,
    participants: Array.from(
      new Set(chatsData.map((row) => row.senderId))
    ),
    messages: chatsData.map((row) => ({
      id: row.messageId,
      senderId: row.senderId,
      text: row.text ?? "",
      imageUri: row.imageUri ?? undefined,
      timestamp: row.timestamp,
      status: row.status as MessageStatus,
    })),
    lastMessage: {
      id: chatsData[0].messageId,
      senderId: chatsData[0].senderId,
      text: chatsData[0].text ?? undefined,
      imageUri: chatsData[0].imageUri ?? undefined,
      timestamp: chatsData[0].timestamp,
      status: chatsData[0].status as MessageStatus,
    },
  };

  return chat;
};

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
    status: MessageStatus.Sent,
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
}: ParticipantRowsParams): Promise<ChatDataParams[]> => {
  const participantRows = await db
    .select({ chatId: chatParticipants.chatId })
    .from(chatParticipants)
    .where(eq(chatParticipants.userId, currentUserId));
  
    // const result = await db
    // .select({ chatId: chatParticipants.chatId })
    // .from(chatParticipants)
    // .innerJoin(chats, eq(chatParticipants.chatId, chats.id))
    // .where(eq(chatParticipants.userId, currentUserId));
    // console.log("result", result);

  return participantRows;
};

export const chatDataDB = async ({
  chatId,
}: ChatDataParams): Promise<ChatDataResponse[]> => {
  const chatData = await db.select().from(chats).where(eq(chats.id, chatId));
  console.log("chatData", chatData);

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
  const data = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(desc(messages.timestamp));
  
  const transformedData = data.map((row) => ({
    id: row.id as string,
    senderId: row.senderId as string,
    text: row.text ?? null,
    imageUri: row.imageUri ?? null,
    timestamp: row.timestamp as number,
    status: row.status as MessageStatus,
  }));
  
  return transformedData;
};

export const getChatByIDDB = async ({
  chatId,
}: {
  chatId: string;
}): Promise<Chat> => {
  const participantsData = await getParticipantsChatDB({ chatId });

  const participants = participantsData.map((p) => p.userId);

  const _messages = await messagesDataDB({ chatId });

  const lastMessage = _messages[0] ?? {
    id: "",
    senderId: "",
    text: null,
    imageUri: null,
    timestamp: 0,
    status: MessageStatus.Sent,
  };

  const chat: Chat = {
    id: chatId,
    participants,
    lastMessage,
  };

  return chat;
};

export const getParticipantsChatDB = async ({ chatId }: { chatId: string }) => {
  return await db
    .select({ userId: chatParticipants.userId })
    .from(chatParticipants)
    .where(eq(chatParticipants.chatId, chatId));
};
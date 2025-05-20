import { db } from "@/src/infrastructure/queries/db";
import { chatParticipants, chats, messages } from "@/src/infrastructure/schema";
import {
  ChatDataParams,
  ChatDataResponse,
  CreateChatParams,
  MessageDataParams,
  ParticipantDataResponse,
  ParticipantRowsParams,
  SendMessageParams,
  UpdateStatusMessageParams,
} from "@/src/data/interfaces/chat.interface";
import { desc, eq } from "drizzle-orm";
import { Message, MessageStatus } from "@/src/domain/entities/message";
import { Chat } from "@/src/domain/entities/chat";
import { alias } from "drizzle-orm/sqlite-core";

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
  page = 0,
}: MessageDataParams): Promise<Message[]> => {
  const limit = 10;

  const data = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(desc(messages.timestamp))
    .limit(limit)
    .offset(page * limit);

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

export const getAllUserChatsDB = async ({
  currentUserId,
  page = 0,
}: {
  currentUserId: string;
  page?: number;
}): Promise<Chat[]> => {
  const limit = 1;
  const chatParticipants_2 = alias(chatParticipants, "cp2");

  const rows = await db
    .select({
      chatId: chatParticipants.chatId,
      participantUserId: chatParticipants_2.userId,
      messageId: messages.id,
      senderId: messages.senderId,
      text: messages.text,
      imageUri: messages.imageUri,
      timestamp: messages.timestamp,
      status: messages.status,
    })
    .from(chatParticipants)
    .innerJoin(
      chatParticipants_2,
      eq(chatParticipants.chatId, chatParticipants_2.chatId)
    )
    .leftJoin(messages, eq(chatParticipants.chatId, messages.chatId))
    .where(eq(chatParticipants.userId, currentUserId))
    .orderBy(desc(messages.timestamp))
    .limit(limit)
    .offset(page * limit);

  const chatMap: Record<string, Chat> = {};

  for (const row of rows) {
    const chatId = row.chatId;

    if (!chatMap[chatId]) {
      chatMap[chatId] = {
        id: chatId,
        participants: [],
        lastMessage: row.messageId
          ? {
              id: row.messageId,
              senderId: row.senderId ?? "",
              text: row.text ?? null,
              imageUri: row.imageUri ?? null,
              timestamp: row.timestamp as number,
              status: row.status as MessageStatus,
            }
          : undefined,
      };
    }

    if (
      row.participantUserId &&
      !chatMap[chatId].participants.includes(row.participantUserId)
    ) {
      chatMap[chatId].participants.push(row.participantUserId);
    }
  }

  return Object.values(chatMap);
};

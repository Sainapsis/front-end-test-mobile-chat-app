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
  // Obtener participantes del chat
  const participantsData = await getParticipantsChatDB({ chatId });

  const participants = participantsData.map((p) => p.userId);

  // Obtener mensajes del chat
  const messagesData = await db
    .select({
      chatId: chats.id,
      messageId: messages.id,
      senderId: messages.senderId,
      text: messages.text,
      imageUri: messages.imageUri,
      timestamp: messages.timestamp,
      status: messages.status,
    })
    .from(chats)
    .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
    .leftJoin(messages, eq(chats.id, messages.chatId))
    .where(
      and(eq(chatParticipants.userId, currentUserId), eq(chats.id, chatId))
    )
    .orderBy(desc(messages.timestamp));
  // .limit(5) // Paginación opcional

  const _messages = messagesData
    .filter(
      (row) =>
        row.messageId !== null &&
        row.senderId !== null &&
        row.timestamp !== null
    )
    .map((row) => ({
      id: row.messageId as string,
      senderId: row.senderId as string,
      text: row.text ?? "",
      imageUri: row.imageUri ?? undefined,
      timestamp: row.timestamp as number,
      status: row.status as MessageStatus,
    }));

  const lastMessage = _messages[0] ?? {
    id: "",
    senderId: "",
    text: undefined,
    imageUri: undefined,
    timestamp: 0,
    status: null,
  };

  const chat: Chat = {
    id: chatId,
    participants,
    messages: _messages,
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

import { db } from "@/src/infrastructure/queries/db";
import { chatParticipants, chats, messages } from "@/src/infrastructure/schema";
import {
  SendMessageParams,
  UpdateStatusMessageParams,
} from "@/src/data/interfaces/chatRoom.interface";
import { and, desc, eq } from "drizzle-orm";
import { MessageStatus } from "@/src/domain/entities/message";
import { Chat } from "@/src/domain/entities/chat";

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
    participants: Array.from(new Set(chatsData.map((row) => row.senderId))),
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

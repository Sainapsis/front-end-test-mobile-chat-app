import { db } from "@/src/infrastructure/queries/db";
import { and, desc, eq, not } from "drizzle-orm";
import { Message, MessageStatus } from "@/src/domain/entities/message";
import { Chat } from "@/src/domain/entities/chat";
import {
  SendMessageParams,
  UpdateStatusMessageParams,
} from "@/src/data/interfaces/chatRoom.interface";
import { chatParticipants, messages, users } from "../schema";

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
  currentUserId,
  statusToUpdate,
  currentStatus,
}: UpdateStatusMessageParams): Promise<boolean> => {
  try {
    const updatedMessages = await db
      .update(messages)
      .set({ status: statusToUpdate })
      .where(
        and(
          eq(messages.status, currentStatus),
          not(eq(messages.senderId, currentUserId))
        )
      )
      .returning();

    if (updatedMessages.length !== updatedMessages.length) return false;

    return true;
  } catch (error) {
    console.error("Error updating message status:", error);
    return false;
  }
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
}: {
  chatId: string;
}): Promise<Chat> => {
  const participants = await db
    .select({
      id: users.id,
      name: users.name,
      avatar: users.avatar,
      status: users.status,
    })
    .from(chatParticipants)
    .innerJoin(users, eq(chatParticipants.userId, users.id))
    .where(eq(chatParticipants.chatId, chatId));

  const _messages = await db
    .select({
      id: messages.id,
      chatId: messages.chatId,
      text: messages.text,
      senderId: messages.senderId,
      imageUri: messages.imageUri,
      timestamp: messages.timestamp,
      status: messages.status,
      sender: {
        id: users.id,
        name: users.name,
        avatar: users.avatar,
        status: users.status,
      },
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.chatId, chatId))
    .orderBy(desc(messages.timestamp));

  return {
    id: chatId,
    participants,
    messages: _messages as Message[],
  };
};

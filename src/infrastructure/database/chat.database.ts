import { db } from "@/database/db";
import { chatParticipants, chats, messages } from "@/database/schema";
import {
  CreateChatParams,
  SendMessageParams,
  UpdateStatusMessageParams,
} from "@/src/data/interfaces/chat.interface";
import { eq } from "drizzle-orm";

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

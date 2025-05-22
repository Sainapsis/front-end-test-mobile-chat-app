import { db } from "@/src/infrastructure/queries/db";
import {
  chatParticipants,
  chats,
  messages,
  users,
} from "@/src/infrastructure/schema";
import {
  ChatDataParams,
  ChatDataResponse,
  CreateChatParams,
  MessageDataParams,
  ParticipantDataResponse,
  ParticipantRowsParams,
} from "@/src/data/interfaces/chat.interface";
import { and, desc, eq, inArray, not, sql } from "drizzle-orm";
import { Message, MessageStatus } from "@/src/domain/entities/message";
import { Chat } from "@/src/domain/entities/chat";

export const createChatDB = async ({
  chatId,
  participants,
}: CreateChatParams): Promise<boolean> => {
  try {
    const existingChat = await db
      .select({ chatId: chatParticipants.chatId })
      .from(chatParticipants)
      .where(
        inArray(
          chatParticipants.userId,
          participants.map((user) => user.id)
        )
      )
      .groupBy(chatParticipants.chatId)
      .having(sql`COUNT(${chatParticipants.userId}) = ${participants.length}`)
      .limit(1);

    if (existingChat.length > 0) {
      console.warn("Chat with the same participants already exists.");
      return false;
    } else {
      const chat = await db.insert(chats).values({ id: chatId }).returning();

      if (chat.length === 0) return false;

      const participantRows = participants.map((user) => ({
        id: `cp-${chatId}-${user.id}`,
        chatId,
        userId: user.id,
      }));

      const insertedParticipants = await db
        .insert(chatParticipants)
        .values(participantRows)
        .returning();

      if (insertedParticipants.length !== participants.length) return false;

      return true;
    }
  } catch (error) {
    console.error("Error creating chat:", error);
    return false;
  }
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
  const LIMIT = 10;

  const data = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      text: messages.text,
      imageUri: messages.imageUri,
      timestamp: messages.timestamp,
      status: messages.status,
    })
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(desc(messages.timestamp))
    .limit(LIMIT)
    .offset(page * LIMIT);

  const transformedData = data.map(
    ({ id, senderId, text, imageUri, timestamp, status }) => ({
      id,
      senderId,
      text: text ?? null,
      imageUri: imageUri ?? null,
      timestamp,
      status: status as MessageStatus,
    })
  );

  return transformedData;
};

export const getAllUserChatsDB = async ({
  currentUserId,
  page = 0,
}: {
  currentUserId: string;
  page?: number;
}): Promise<Chat[]> => {
  const LIMIT = 10;

  const latestMessages = db
    .select({
      chatId: messages.chatId,
      maxTimestamp: sql`MAX(${messages.timestamp})`.as("maxTimestamp"),
    })
    .from(messages)
    .groupBy(messages.chatId)
    .as("latest_messages");

  const chatRows = await db
    .select({
      chatId: chatParticipants.chatId,
      messageId: messages.id,
      senderId: messages.senderId,
      text: messages.text,
      imageUri: messages.imageUri,
      timestamp: messages.timestamp,
      status: messages.status,
    })
    .from(chatParticipants)
    .leftJoin(
      latestMessages,
      eq(chatParticipants.chatId, latestMessages.chatId)
    )
    .leftJoin(
      messages,
      and(
        eq(messages.chatId, latestMessages.chatId),
        eq(messages.timestamp, latestMessages.maxTimestamp)
      )
    )
    .where(eq(chatParticipants.userId, currentUserId))
    .orderBy(desc(messages.timestamp))
    // .orderBy(sql`${messages.timestamp} DESC NULLS LAST`)
    .limit(LIMIT)
    .offset(page * LIMIT);

  const chatIds = chatRows.map((row) => row.chatId);

  if (chatIds.length === 0) return [];

  const participantRows = await db
    .select({
      chatId: chatParticipants.chatId,
      userId: users.id,
      name: users.name,
      avatar: users.avatar,
      status: users.status,
    })
    .from(chatParticipants)
    .innerJoin(users, eq(chatParticipants.userId, users.id))
    .where(
      and(
        inArray(chatParticipants.chatId, chatIds),
        not(eq(chatParticipants.userId, currentUserId))
      )
    );

  const chatMap: Record<string, Chat> = {};

  for (const row of chatRows) {
    chatMap[row.chatId] = {
      id: row.chatId,
      participants: [],
      messages: row.messageId
        ? [
            {
              id: row.messageId,
              senderId: row.senderId ?? "",
              text: row.text ?? null,
              imageUri: row.imageUri ?? null,
              timestamp: row.timestamp ?? 0,
              status: row.status as MessageStatus,
            },
          ]
        : [],
    };
  }

  for (const participant of participantRows) {
    if (chatMap[participant.chatId]) {
      chatMap[participant.chatId].participants.push({
        id: participant.userId,
        name: participant.name,
        avatar: participant.avatar,
        status: participant.status,
      });
    }
  }

  return Object.values(chatMap);
};

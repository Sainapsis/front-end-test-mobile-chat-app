// TP
import { useState, useEffect, useCallback } from "react";
import { eq } from "drizzle-orm";

//BL
import { db } from "../../database/db";
import { chats, chatParticipants, messages } from "../../database/schema";
import {
  ChatInterface,
  SendMessageInterface,
  MessageInterface,
  SetMessageAsReadInterface,
  DeleteMessageProps,
  ForwardMessageProps,
  AddReactionToMessageProps,
} from "@/interfaces/Messages.interface";

export function useChatsDb(currentUserId: string | null) {
  const [userChats, setUserChats] = useState<ChatInterface[]>([]);
  const [loading, setLoading] = useState(true);

  const updateChatMessages = (
    chatId: string,
    updater: (messages: MessageInterface[]) => MessageInterface[]
  ) => {
    setUserChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: updater(chat.messages),
            }
          : chat
      )
    );
  };

  const getChatIdsWhereTheCurrentUserIsParticipant = async () => {
    if (!currentUserId) {
      return [];
    }

    try {
      const participantRows = await db
        .select()
        .from(chatParticipants)
        .where(eq(chatParticipants.userId, currentUserId));
      const chatIds = participantRows.map((row) => row.chatId);
      return chatIds;
    } catch (error) {
      console.error("Error getting chat IDs:", error);
      return [];
    }
  };

  const getSingleChat = async (chatId: string) => {
    try {
      const chatData = await db
        .select()
        .from(chats)
        .where(eq(chats.id, chatId));
      return chatData;
    } catch (error) {
      console.error("Error getting chat:", error);
      throw new Error("Error getting chat");
    }
  };

  const getChatMessages = async (chatId: string) => {
    try {
      const messagesData = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, chatId))
        .orderBy(messages.timestamp);
      return messagesData;
    } catch (error) {
      console.error("Error getting chat messages:", error);
      throw new Error("Error getting chat messages");
    }
  };

  const getChatParticipants = async (chatId: string) => {
    try {
      const participantsData = await db
        .select()
        .from(chatParticipants)
        .where(eq(chatParticipants.chatId, chatId));
      return participantsData;
    } catch (error) {
      console.error("Error getting chat participants:", error);
      throw new Error("Error getting chat participants");
    }
  };

  const loadChats = async () => {
    if (!currentUserId) {
      setUserChats([]);
      setLoading(false);
      return;
    }

    try {
      // Get all the chat ids where the current user is a participant
      const chatIds = await getChatIdsWhereTheCurrentUserIsParticipant();
      if (chatIds.length === 0) {
        setUserChats([]);
        setLoading(false);
        return;
      }

      // Build the complete chat objects
      const loadedChats: ChatInterface[] = [];

      for (const chatId of chatIds) {
        // Get the chat
        const chatData = await getSingleChat(chatId);

        if (chatData.length === 0) continue;

        // Get participants
        const participantsData = await getChatParticipants(chatId);
        const participantIds = participantsData.map((p) => p.userId);

        // Get messages
        const messagesData = await getChatMessages(chatId);
        const chatMessages = messagesData.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          text: m.text,
          reaction: m.reaction || undefined,
          timestamp: m.timestamp,
          status: m.status as "sent" | "read",
        }));

        // Determine last message
        const lastMessage =
          chatMessages.length > 0
            ? chatMessages[chatMessages.length - 1]
            : undefined;

        loadedChats.push({
          id: chatId,
          participants: participantIds,
          messages: chatMessages,
          lastMessage,
        });
      }

      setUserChats(loadedChats);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, [currentUserId]);

  const createChat = useCallback(
    async (participantIds: string[]) => {
      if (!currentUserId || !participantIds.includes(currentUserId)) {
        return null;
      }

      try {
        const chatId = `chat${Date.now()}`;

        // Insert new chat
        await db.insert(chats).values({
          id: chatId,
        });

        // Insert participants
        for (const userId of participantIds) {
          await db.insert(chatParticipants).values({
            id: `cp-${chatId}-${userId}`,
            chatId: chatId,
            userId: userId,
          });
        }

        const newChat: ChatInterface = {
          id: chatId,
          participants: participantIds,
          messages: [],
        };

        setUserChats((prevChats) => [...prevChats, newChat]);
        return newChat;
      } catch (error) {
        console.error("Error creating chat:", error);
        return null;
      }
    },
    [currentUserId]
  );

  const forwardMessage = async ({
    senderId,
    targetChatId,
    messageId,
  }: ForwardMessageProps) => {
    try {
      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId));

      if (!message) {
        throw new Error("Message not found");
      }

      const newMessageId = `msg${Date.now()}`;

      const forwardedMessage: MessageInterface = {
        id: newMessageId,
        senderId: senderId,
        text: message.text,
        timestamp: Date.now(),
        status: "sent",
      };

      await db.insert(messages).values({
        id: newMessageId,
        chatId: targetChatId,
        senderId: senderId,
        text: message.text,
        timestamp: Date.now(),
      });

      updateChatMessages(targetChatId, (messages) => [
        ...messages,
        forwardedMessage,
      ]);
    } catch (error) {
      console.error("Error forwarding message:", error);
    }
  };

  const deleteMessage = async ({ chatId, messageId }: DeleteMessageProps) => {
    try {
      await db.delete(messages).where(eq(messages.id, messageId));

      updateChatMessages(chatId, (messages) =>
        messages.filter((message) => message.id !== messageId)
      );
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const addReactionToMessage = async ({
    chatId,
    messageId,
    reaction,
  }: AddReactionToMessageProps) => {
    try {
      await db
        .update(messages)
        .set({ reaction })
        .where(eq(messages.id, messageId));

      updateChatMessages(chatId, (messages) =>
        messages.map((message) =>
          message.id === messageId ? { ...message, reaction } : message
        )
      );
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const editMessage = async ({
    chatId,
    messageId,
    newText,
  }: {
    chatId: string;
    messageId: string;
    newText: string;
  }) => {
    try {
      await db
        .update(messages)
        .set({ text: newText })
        .where(eq(messages.id, messageId));

      updateChatMessages(chatId, (messages) =>
        messages.map((message) =>
          message.id === messageId ? { ...message, text: newText } : message
        )
      );

      loadChats();
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const sendMessage = useCallback(
    async ({ text, chatId, senderId }: SendMessageInterface) => {
      if (!text.trim()) return false;

      try {
        const messageId = `msg${Date.now()}`;
        const timestamp = Date.now();

        await db.insert(messages).values({
          id: messageId,
          chatId: chatId,
          senderId: senderId,
          text: text,
          timestamp: timestamp,
        });

        const newMessage: MessageInterface = {
          id: messageId,
          senderId,
          text,
          timestamp,
          status: "sent",
        };

        updateChatMessages(chatId, (messages) => [...messages, newMessage]);

        return true;
      } catch (error) {
        console.error("Error sending message:", error);
        return false;
      }
    },
    []
  );

  const setMessageAsRead = async ({
    id,
    chatId,
  }: SetMessageAsReadInterface) => {
    try {
      await db
        .update(messages)
        .set({ status: "read" })
        .where(eq(messages.id, id));

      updateChatMessages(chatId, (messages) =>
        messages.map((message) =>
          message.id === id ? { ...message, status: "read" } : message
        )
      );
    } catch (error) {
      console.error("Error setting message as read:", error);
      return false;
    }
  };

  return {
    chats: userChats,
    createChat,
    sendMessage,
    deleteMessage,
    loading,
    editMessage,
    setMessageAsRead,
    forwardMessage,
    addReactionToMessage,
  };
}


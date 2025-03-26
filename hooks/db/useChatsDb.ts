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
  SetMessageAsReadProps,
  DeleteMessageProps,
  ForwardMessageProps,
  AddReactionToMessageProps,
} from "@/interfaces/Messages.interface";

export function useChatsDb(currentUserId: string | null) {
  const [userChats, setUserChats] = useState<ChatInterface[]>([]);
  const [loading, setLoading] = useState(true);

  // there are so many responsabilities here, we should refactor this
  const loadChats = async () => {
    if (!currentUserId) {
      setUserChats([]);
      setLoading(false);
      return;
    }

    try {
      // Get chat IDs where the user is a participant
      const participantRows = await db
        .select()
        .from(chatParticipants)
        .where(eq(chatParticipants.userId, currentUserId));

      const chatIds = participantRows.map((row) => row.chatId);

      if (chatIds.length === 0) {
        setUserChats([]);
        setLoading(false);
        return;
      }
      // Build the complete chat objects
      const loadedChats: ChatInterface[] = [];
      for (const chatId of chatIds) {
        // Get the chat
        const chatData = await db
          .select()
          .from(chats)
          .where(eq(chats.id, chatId));

        if (chatData.length === 0) continue;

        // Get participants
        const participantsData = await db
          .select()
          .from(chatParticipants)
          .where(eq(chatParticipants.chatId, chatId));

        const participantIds = participantsData.map((p) => p.userId);

        // Get messages
        const messagesData = await db
          .select()
          .from(messages)
          .where(eq(messages.chatId, chatId))
          .orderBy(messages.timestamp);

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
      const newMessageTimestamp = Date.now();

      const forwardedMessage: MessageInterface = {
        id: newMessageId,
        senderId: senderId,
        text: message.text,
        timestamp: newMessageTimestamp,
        status: "sent",
      };

      await db.insert(messages).values({
        id: newMessageId,
        chatId: targetChatId,
        senderId: senderId,
        text: message.text,
        timestamp: newMessageTimestamp,
      });

      setUserChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === targetChatId
            ? {
                ...chat,
                messages: [...chat.messages, forwardedMessage],
                lastMessage: forwardedMessage,
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Error forwarding message:", error);
    }
  };

  const deleteMessage = async ({ chatId, messageId }: DeleteMessageProps) => {
    try {
      await db.delete(messages).where(eq(messages.id, messageId));

      setUserChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: chat.messages.filter(
                (message) => message.id !== messageId
              ),
            };
          }
          return chat;
        });
      });
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

      setUserChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: chat.messages.map((message) => {
                if (message.id === messageId) {
                  return {
                    ...message,
                    reaction,
                  };
                }
                return message;
              }),
            };
          }
          return chat;
        });
      });
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

      setUserChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: chat.messages.map((message) =>
                message.id === messageId
                  ? { ...message, text: newText }
                  : message
              ),
            };
          }
          return chat;
        });
      });

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

        // Insert new message
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

        // Update state
        setUserChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastMessage: newMessage,
              };
            }
            return chat;
          });
        });

        return true;
      } catch (error) {
        console.error("Error sending message:", error);
        return false;
      }
    },
    []
  );

  const setMessageAsRead = async ({ id, chatId }: SetMessageAsReadProps) => {
    try {
      await db
        .update(messages)
        .set({ status: "read" })
        .where(eq(messages.id, id));

      setUserChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: chat.messages.map((message) =>
                message.id === id ? { ...message, status: "read" } : message
              ),
            };
          }
          return chat;
        });
      });
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


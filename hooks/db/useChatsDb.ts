import { useState, useEffect, useCallback } from 'react';
import { db } from '../../database/db';
import { chats, chatParticipants, messages } from '../../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
}

export function useChatsDb(currentUserId: string | null) {
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  // Load chats for the current user
  useEffect(() => {
    const loadChats = async () => {
      if (!currentUserId) {
        setUserChats([]);
        setLoading(false);
        return;
      }

      try {
        const participantRows = await db
          .select()
          .from(chatParticipants)
          .where(eq(chatParticipants.userId, currentUserId));

        const chatIds = participantRows.map(row => row.chatId);

        if (chatIds.length === 0) {
          setUserChats([]);
          setLoading(false);
          return;
        }

        const loadedChats: Chat[] = [];

        for (const chatId of chatIds) {
          const chatData = await db
            .select()
            .from(chats)
            .where(eq(chats.id, chatId));

          if (chatData.length === 0) continue;

          const participantsData = await db
            .select()
            .from(chatParticipants)
            .where(eq(chatParticipants.chatId, chatId));

          const participantIds = participantsData.map(p => p.userId);

          const lastMessageData = await db
            .select()
            .from(messages)
            .where(eq(messages.chatId, chatId))
            .orderBy(desc(messages.timestamp))
            .limit(1);

          const lastMessage = lastMessageData.length > 0 ? {
            id: lastMessageData[0].id,
            senderId: lastMessageData[0].senderId,
            text: lastMessageData[0].text,
            timestamp: lastMessageData[0].timestamp,
          } : undefined;

          loadedChats.push({
            id: chatId,
            participants: participantIds,
            messages: [], // Messages will be loaded dynamically
            lastMessage,
          });
        }

        setUserChats(loadedChats);
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [currentUserId]);

  // Function to load messages for a specific chat
  const loadMessagesForChat = useCallback(async (chatId: string) => {
    try {
      const messagesData = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, chatId))
        .orderBy(messages.timestamp);

      const chatMessages = messagesData.map(m => ({
        id: m.id,
        senderId: m.senderId,
        text: m.text,
        timestamp: m.timestamp,
      }));

      setUserChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId
            ? { ...chat, messages: chatMessages }
            : chat
        )
      );
    } catch (error) {
      console.error('Error loading messages for chat:', error);
    }
  }, []);

  const createChat = useCallback(async (participantIds: string[]) => {
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

      const newChat: Chat = {
        id: chatId,
        participants: participantIds,
        messages: [],
      };

      setUserChats(prevChats => [...prevChats, newChat]);
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  }, [currentUserId]);

  const sendMessage = useCallback(async (chatId: string, text: string, senderId: string) => {
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

      const newMessage: Message = {
        id: messageId,
        senderId,
        text,
        timestamp,
      };

      // Update state
      setUserChats(prevChats => {
        return prevChats.map(chat => {
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
      console.error('Error sending message:', error);
      return false;
    }
  }, []);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await db.delete(chats).where(eq(chats.id, chatId));
      setUserChats(prevChats => prevChats.filter(chat => chat.id !== chatId));

      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  }, []);

  const deleteMessage = useCallback(async (chatId: string, messageId: string) => {
    try {
      // Delete the message from the database
      await db.delete(messages).where(eq(messages.id, messageId));

      // Update state to remove the message
      setUserChats(prevChats =>
        prevChats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: chat.messages.filter(message => message.id !== messageId),
              lastMessage: chat.messages.length > 1
                ? chat.messages[chat.messages.length - 2]
                : undefined,
            };
          }
          return chat;
        })
      );

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }, []);

  const editMessage = useCallback(async (chatId: string, messageId: string, newText: string) => {
    if (!newText.trim()) return false;

    try {
      // Update the message in the database
      await db
        .update(messages)
        .set({ text: newText })
        .where(eq(messages.id, messageId));

      // Update state to reflect the edited message
      setUserChats(prevChats =>
        prevChats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: chat.messages.map(message =>
                message.id === messageId
                  ? { ...message, text: newText }
                  : message
              ),
              lastMessage: chat.lastMessage?.id === messageId
                ? { ...chat.lastMessage, text: newText }
                : chat.lastMessage,
            };
          }
          return chat;
        })
      );

      return true;
    } catch (error) {
      console.error('Error editing message:', error);
      return false;
    }
  }, []);

  return {
    chats: userChats,
    createChat,
    sendMessage,
    deleteChat,
    deleteMessage,
    editMessage,
    loadMessagesForChat,
    loading,
  };
} 
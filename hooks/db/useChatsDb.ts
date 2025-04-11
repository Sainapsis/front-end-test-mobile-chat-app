import { useState, useEffect, useCallback } from 'react';
import { db } from '../../database/db';
import { chats, chatParticipants, messages } from '../../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  reaction?: string;
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
  const loadChats = useCallback(async () => {
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
          reaction: m.reaction ?? undefined,
        }));

        const lastMessage = chatMessages.length > 0
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
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);


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

  const updateMessage = useCallback(async (
    chatId: string,
    messageId: string,
    updates: Partial<Message>

  ): Promise<boolean> => {
      console.log('Updates recibidos:', updates);
    try {
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id !== chatId) return chat;

          const updatedMessages = chat.messages.map(message => {
            if (message.id === messageId) {
              return { ...message, ...updates };
            }
            return message;
          });

          return {
            ...chat,
            messages: updatedMessages,
            lastMessage:
              chat.lastMessage?.id === messageId
                ? { ...chat.lastMessage, ...updates }
                : chat.lastMessage,
          };
        });
      });

      const valuesToUpdate: Partial<Message> = {};

      if (updates.text !== undefined) {
        valuesToUpdate.text = updates.text;
      }
      if (updates.reaction !== undefined) {
        valuesToUpdate.reaction = updates.reaction;
      }
      if (updates.timestamp !== undefined) {
        valuesToUpdate.timestamp = updates.timestamp;
      }

      if (Object.keys(valuesToUpdate).length === 0) {
        console.warn('No values to update');
        return false; // o simplemente return true si no consideras esto un error
      }

      await db.update(messages)
        .set(valuesToUpdate)
        .where(eq(messages.id, messageId));

      const updated = await db.select().from(messages).where(eq(messages.id, messageId));
      console.log('Mensaje desde DB:', updated);

      return true;
    } catch (error) {
      console.error('Error updating message:', error);
      return false;
    }
  }, []);

  const deleteMessage = useCallback(async (chatId: string, messageId: string): Promise<boolean> => {
    try {
      // Eliminar mensaje de la base de datos
      await db.delete(messages).where(eq(messages.id, messageId));

      // Actualizar estado local
      setUserChats(prevChats =>
        prevChats.map(chat => {
          if (chat.id !== chatId) return chat;

          const updatedMessages = chat.messages.filter(m => m.id !== messageId);
          const lastMessage = updatedMessages.length > 0 ? updatedMessages[updatedMessages.length - 1] : undefined;

          return {
            ...chat,
            messages: updatedMessages,
            lastMessage,
          };
        })
      );

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }, []);


  return {
    chats: userChats,
    createChat,
    sendMessage,
    updateMessage,
    deleteMessage,
    loadChats,
    loading,
  };
} 
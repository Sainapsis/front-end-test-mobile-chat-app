import { useState, useEffect, useCallback } from 'react';
import { db } from '../../database/db';
import { chats, chatParticipants, messages } from '../../database/schema';
import { eq, and } from 'drizzle-orm';

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

  // Cargar chats del usuario
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
          const chatData = await db.select().from(chats).where(eq(chats.id, chatId));
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
          }));

          const lastMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : undefined;

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
    };

    loadChats();
  }, [currentUserId]);

  const createChat = useCallback(async (participantIds: string[]) => {
    if (!currentUserId || !participantIds.includes(currentUserId)) {
      return null;
    }

    try {
      const chatId = `chat${Date.now()}`;

      await db.insert(chats).values({ id: chatId });

      for (const userId of participantIds) {
        await db.insert(chatParticipants).values({
          id: `cp-${chatId}-${userId}`,
          chatId,
          userId,
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

      await db.insert(messages).values({
        id: messageId,
        chatId,
        senderId,
        text,
        timestamp,
      });

      const newMessage: Message = {
        id: messageId,
        senderId,
        text,
        timestamp,
      };

      setUserChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastMessage: newMessage,
              }
            : chat
        )
      );

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, []);

  const deleteChat = useCallback(async (chatId: string, userId: string) => {
    try {
      // Eliminar mensajes del chat
      await db.delete(messages).where(eq(messages.chatId, chatId));

      // Eliminar participantes del chat
      await db.delete(chatParticipants).where(eq(chatParticipants.chatId, chatId));

      // Eliminar el chat
      await db.delete(chats).where(eq(chats.id, chatId));

      // Actualizar el estado
      setUserChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }, []);

  const clearChats = useCallback(async (userId: string) => {
    try {
      // Obtener todos los chats donde el usuario es participante
      const participantRows = await db
        .select()
        .from(chatParticipants)
        .where(eq(chatParticipants.userId, userId));

      const chatIds = participantRows.map(row => row.chatId);

      for (const chatId of chatIds) {
        await deleteChat(chatId, userId);
      }
    } catch (error) {
      console.error('Error clearing chats:', error);
    }
  }, [deleteChat]);

  return {
    chats: userChats,
    createChat,
    sendMessage,
    deleteChat, // ✅ Añadido deleteChat
    clearChats, // ✅ Añadido clearChats
    loading,
  };
}

import { useState, useEffect, useCallback } from 'react';
import { db } from '../../database/db';
import { chats, chatParticipants, messages, chatParticipantsHistory } from '../../database/schema';
import { eq, and, or } from 'drizzle-orm';

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
        // Obtener chats activos y históricos
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

          // Obtener participantes actuales y históricos
          const [currentParticipants, historicalParticipants] = await Promise.all([
            db.select().from(chatParticipants).where(eq(chatParticipants.chatId, chatId)),
            db.select().from(chatParticipantsHistory).where(eq(chatParticipantsHistory.chatId, chatId))
          ]);

          // Combinar participantes sin duplicados
          const participantIds = [...new Set([
            ...currentParticipants.map(p => p.userId),
            ...historicalParticipants.map(p => p.userId)
          ])];

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
      // Guardar registro histórico antes de eliminar
      await db.insert(chatParticipantsHistory).values({
        id: `cph-${chatId}-${userId}-${Date.now()}`,
        chatId,
        userId,
        leftAt: Date.now(),
      });

      // Eliminar participación actual
      await db
        .delete(chatParticipants)
        .where(
          and(
            eq(chatParticipants.chatId, chatId),
            eq(chatParticipants.userId, userId)
          )
        );

      // Verificar participantes restantes
      const remainingParticipants = await db
        .select()
        .from(chatParticipants)
        .where(eq(chatParticipants.chatId, chatId));

      if (remainingParticipants.length === 0) {
        await db.delete(messages).where(eq(messages.chatId, chatId));
        await db.delete(chats).where(eq(chats.id, chatId));
      }

      setUserChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }, []);

  const clearChats = useCallback(async (userId: string) => {
    try {
      const participantRows = await db
        .select()
        .from(chatParticipants)
        .where(eq(chatParticipants.userId, userId));

      // Guardar todos los registros en el historial
      await Promise.all(
        participantRows.map(row => 
          db.insert(chatParticipantsHistory).values({
            id: `cph-${row.chatId}-${userId}-${Date.now()}`,
            chatId: row.chatId,
            userId,
            leftAt: Date.now(),
          })
        )
      );

      // Eliminar todas las participaciones del usuario
      await db
        .delete(chatParticipants)
        .where(eq(chatParticipants.userId, userId));

      // Verificar cada chat y eliminar los que quedaron sin participantes
      for (const row of participantRows) {
        const remainingParticipants = await db
          .select()
          .from(chatParticipants)
          .where(eq(chatParticipants.chatId, row.chatId));

        if (remainingParticipants.length === 0) {
          await db.delete(messages).where(eq(messages.chatId, row.chatId));
          await db.delete(chats).where(eq(chats.id, row.chatId));
        }
      }

      // Actualizar el estado local
      setUserChats([]);
    } catch (error) {
      console.error('Error clearing chats:', error);
    }
  }, []);

  return {
    chats: userChats,
    createChat,
    sendMessage,
    deleteChat, // ✅ Añadido deleteChat
    clearChats, // ✅ Añadido clearChats
    loading,
  };
}

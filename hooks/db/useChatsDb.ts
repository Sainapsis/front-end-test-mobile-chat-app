import { useState, useEffect, useCallback } from 'react';
import { db } from '@/database/db';
import { chats, chatParticipants, messages, chatParticipantsHistory, deletedMessages, messageReactions } from '@/database/schema';
import { eq, and, or } from 'drizzle-orm';
import { MessageReaction, Message, Chat } from '@/types/Chat';

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

          // Get deleted messages for current user
          const deletedMessagesData = await db
            .select()
            .from(deletedMessages)
            .where(
              and(
                eq(deletedMessages.chatId, chatId),
                eq(deletedMessages.userId, currentUserId)
              )
            );

          const deletedMessageIds = new Set(deletedMessagesData.map(dm => dm.messageId));

          const messagesData = await db
            .select()
            .from(messages)
            .where(eq(messages.chatId, chatId))
            .orderBy(messages.timestamp);

          // Get reactions for all messages
          const reactionsData = await db
            .select()
            .from(messageReactions)
            .where(
              or(
                ...messagesData.map(m => eq(messageReactions.messageId, m.id))
              )
            );

          // Group reactions by message
          const messageReactionsMap = reactionsData.reduce((acc, reaction) => {
            if (!acc[reaction.messageId]) {
              acc[reaction.messageId] = [];
            }
            acc[reaction.messageId].push({
              id: reaction.id,
              userId: reaction.userId,
              emoji: reaction.emoji,
              createdAt: reaction.createdAt,
            });
            return acc;
          }, {} as Record<string, MessageReaction[]>);

          const chatMessages = messagesData
            .filter(m => !deletedMessageIds.has(m.id))
            .map(m => ({
              id: m.id,
              senderId: m.senderId,
              text: m.text,
              timestamp: m.timestamp,
              reactions: messageReactionsMap[m.id] || [],
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
        reactions: [],
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

  // Add new deleteMessage function
  const deleteMessage = useCallback(async (messageId: string, chatId: string) => {
    if (!currentUserId) return false;

    try {
      await db.insert(deletedMessages).values({
        id: `dm-${messageId}-${currentUserId}-${Date.now()}`,
        messageId,
        userId: currentUserId,
        chatId,
        deletedAt: Date.now(),
      });

      setUserChats(prevChats =>
        prevChats.map(chat => {
          if (chat.id === chatId) {
            const updatedMessages = chat.messages.filter(msg => msg.id !== messageId);
            return {
              ...chat,
              messages: updatedMessages,
              lastMessage: updatedMessages.length > 0 
                ? updatedMessages[updatedMessages.length - 1] 
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
  }, [currentUserId]);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!currentUserId) return false;

    try {
      const reactionId = `react-${messageId}-${currentUserId}-${Date.now()}`;
      await db.insert(messageReactions).values({
        id: reactionId,
        messageId,
        userId: currentUserId,
        emoji,
        createdAt: Date.now(),
      });

      setUserChats(prevChats =>
        prevChats.map(chat => ({
          ...chat,
          messages: chat.messages.map(msg =>
            msg.id === messageId
              ? {
                  ...msg,
                  reactions: [
                    ...msg.reactions,
                    {
                      id: reactionId,
                      userId: currentUserId,
                      emoji,
                      createdAt: Date.now(),
                    },
                  ],
                }
              : msg
          ),
        }))
      );

      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      return false;
    }
  }, [currentUserId]);

  const removeReaction = useCallback(async (reactionId: string, messageId: string) => {
    if (!currentUserId) return false;

    try {
      await db
        .delete(messageReactions)
        .where(eq(messageReactions.id, reactionId));

      setUserChats(prevChats =>
        prevChats.map(chat => ({
          ...chat,
          messages: chat.messages.map(msg =>
            msg.id === messageId
              ? {
                  ...msg,
                  reactions: msg.reactions.filter(r => r.id !== reactionId),
                }
              : msg
          ),
        }))
      );

      return true;
    } catch (error) {
      console.error('Error removing reaction:', error);
      return false;
    }
  }, [currentUserId]);

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    if (!currentUserId || !newText.trim()) return false;

    try {
      const editedAt = Date.now();

      await db.update(messages)
        .set({ text: newText, editedAt })
        .where(eq(messages.id, messageId));

      setUserChats(prevChats =>
        prevChats.map(chat => ({
          ...chat,
          messages: chat.messages.map(msg =>
            msg.id === messageId
              ? { ...msg, text: newText, editedAt }
              : msg
          ),
        }))
      );

      console.log('Message edited successfully!');
      return true;
    } catch (error) {
      console.error('Error editing message:', error);
      return false;
    }
  }, [currentUserId]);

  return {
    chats: userChats,
    createChat,
    sendMessage,
    deleteChat,
    clearChats,
    deleteMessage,
    addReaction,
    removeReaction,
    editMessage,  // Return editMessage function
    loading,
  };
}

import { useState, useEffect, useCallback } from 'react';
import { db } from '../../database/db';
import { chats, chatParticipants, messages } from '../../database/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';

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

        const chatIdsRows = await db
          .select({ chatId: chatParticipants.chatId })
          .from(chatParticipants)
          .where(eq(chatParticipants.userId, currentUserId));
        const chatIds = chatIdsRows.map(row => row.chatId);
        if (chatIds.length === 0) {
          setUserChats([]);
          setLoading(false);
          return;
        }
        // Consulta única con inner joins para obtener chats, participantes y último mensaje
        const rows = await db
          .select({
            chatId: chats.id,
            participantId: chatParticipants.userId,
            messageId: messages.id,
            senderId: messages.senderId,
            messageText: messages.text,
            messageTimestamp: messages.timestamp,
          })
          .from(chats)
          .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
          .leftJoin(
            messages,
            and(
              eq(messages.chatId, chats.id),
              eq(
                messages.timestamp,
                db
                  .select({ maxTimestamp: sql`MAX(${messages.timestamp})` })
                  .from(messages)
                  .where(eq(messages.chatId, chats.id))
              )
            )
          )
          .where(inArray(chats.id, chatIds));

        // Procesar los resultados para agrupar por chat
        // Procesar los resultados para agrupar por chat y participantes
        const chatMap = new Map<
          string,
          { participants: Set<string>; lastMessage?: Message }
        >();

        for (const row of rows) {
          if (!chatMap.has(row.chatId)) {
            chatMap.set(row.chatId, { participants: new Set(), lastMessage: undefined });
          }
          const chat = chatMap.get(row.chatId)!;
          chat.participants.add(row.participantId);
          if (row.messageId) {
            chat.lastMessage = {
              id: row.messageId,
              senderId: row.senderId ?? '',
              text: row.messageText ?? '',
              timestamp: row.messageTimestamp ?? 0,
            };
          }
        }

        // Ahora, para cada chat, obtenemos TODOS los participantes
        const loadedChats: Chat[] = Array.from(chatMap.entries()).map(
          ([id, { participants, lastMessage }]) => ({
            id,
            participants: Array.from(participants), // Aquí estarán todos los participantes
            messages: [],
            lastMessage,
          })
        );

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
  // const loadMessagesForChat = useCallback(async (chatId: string) => {
  //   try {
  //     const messagesData = await db
  //       .select()
  //       .from(messages)
  //       .where(eq(messages.chatId, chatId))
  //       .orderBy(messages.timestamp);

  //     const chatMessages = messagesData.map(m => ({
  //       id: m.id,
  //       senderId: m.senderId,
  //       text: m.text,
  //       timestamp: m.timestamp,
  //     }));

  //     setUserChats(prevChats =>
  //       prevChats.map(chat =>
  //         chat.id === chatId
  //           ? { ...chat, messages: chatMessages }
  //           : chat
  //       )
  //     );
  //   } catch (error) {
  //     console.error('Error loading messages for chat:', error);
  //   }
  // }, []);

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
    loading,
  };
} 
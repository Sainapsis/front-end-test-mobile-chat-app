import { useState, useEffect, useCallback } from 'react';
import { db } from '../../database/db';
import { chats, chatParticipants, messages } from '../../database/schema';
import { desc, eq } from 'drizzle-orm';
import { Message, MessageStatus } from '@/database/interface/message';
import { Chat } from '@/database/interface/chat';

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
      // Get chat IDs where the user is a participant
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

        const participantIds = participantsData.map(p => p.userId);

        // Get messages
        const messagesData = await db
          .select()
          .from(messages)
          .where(eq(messages.chatId, chatId))
          .orderBy(desc(messages.timestamp));

        const chatMessages = messagesData.map(message => ({
          id: message.id,
          senderId: message.senderId,
          text: message.text,
          imageUri: message.imageUri ?? null,
          timestamp: message.timestamp,
          status: message.status as MessageStatus,
        }));

        const lastMessage = chatMessages.length > 0
          ? chatMessages[0]
          : undefined;

        loadedChats.push({
          id: chatId,
          participants: participantIds,
          messages: chatMessages as Message[],
          lastMessage: lastMessage as Message | undefined,
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

  const sendMessage = useCallback(async (chatId: string, message: Message) => {
    if (!message.text?.trim() && !message.imageUri) return false;

    try {
      // Insert new message
      await db.insert(messages).values({
        id: message.id,
        chatId: chatId,
        senderId: message.senderId,
        text: message.text,
        imageUri: message.imageUri,
        timestamp: message.timestamp,
        status: message.status,
      });

      // Update state
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [message, ...chat.messages],
              lastMessage: message,
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

  const handleLoadMore = async () => {
    console.log('handleLoadMore called');
//     if (loading /*|| noMoreMessages*/) return;
// 
//     setLoading(true);
//     const olderMessages = await fetchOlderMessages(lastMessageId);
//     setUserChats(prev => [...prev, ...olderMessages]);
//     setLoading(false);
// 
//     if (olderMessages.length === 0) {
//       setNoMoreMessages(true);
//     }
  };

  const editMessage = useCallback(async (chatId: string, messageId: string, newText: string) => {
    if (!newText.trim()) return false;

    try {
      // Actualiza en la base de datos
      await db.update(messages)
        .set({ text: newText })
        .where(eq(messages.id, messageId));

      // Actualiza en el estado local
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === chatId) {
            const updatedMessages = chat.messages.map(msg =>
              msg.id === messageId ? { ...msg, text: newText } : msg
            );

            const lastMessage = updatedMessages.length > 0 ? updatedMessages[updatedMessages.length - 1] : undefined;

            return {
              ...chat,
              messages: updatedMessages,
              lastMessage,
            };
          }
          return chat;
        });
      });

      return true;
    } catch (error) {
      console.error('Error editing message:', error);
      return false;
    }
  }, []);

  const deleteMessage = useCallback(async (chatId: string, messageId: string) => {
    try {
      // Elimina de la base de datos
      await db.delete(messages).where(eq(messages.id, messageId));

      // Actualiza en el estado local
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === chatId) {
            const updatedMessages = chat.messages.filter(msg => msg.id !== messageId);

            const lastMessage = updatedMessages.length > 0 ? updatedMessages[updatedMessages.length - 1] : undefined;

            return {
              ...chat,
              messages: updatedMessages,
              lastMessage,
            };
          }
          return chat;
        });
      });

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }, []);

  const updateMessageStatus = useCallback(async (chatId: string, messageId: string, status: MessageStatus) => {
    try {
      await db.update(messages)
        .set({ status })
        .where(eq(messages.id, messageId));

      setUserChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === chatId) {
            const updatedMessages = chat.messages.map(msg =>
              msg.id === messageId ? { ...msg, status } : msg
            );

            const lastMessage = updatedMessages.length > 0 ? updatedMessages[updatedMessages.length - 1] : undefined;

            return {
              ...chat,
              messages: updatedMessages,
              lastMessage,
            };
          }
          return chat;
        });
      });
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }, []);

  return {
    chats: userChats,
    createChat,
    sendMessage,
    editMessage,
    deleteMessage,
    updateMessageStatus,
    loading,
    handleLoadMore,
  };
} 
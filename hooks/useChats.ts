import { useState, useEffect, useCallback } from 'react';
import { db } from '../database/db';
import { chats as chatsSchema, chatParticipants } from '../database/schema';
import { useAuthContext } from '@/contexts/AuthContext';
import { getUserChatsWithDetails } from '../database/queries/chatQueries';
import { mapChatFromDB, ChatWithDetails } from '../utils/chatMappers';

export type Chat = ChatWithDetails;

export function useChats() {
  const { currentUser, userLoading } = useAuthContext();
  const currentUserId = !userLoading ? currentUser?.id || null : null;
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChat] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      if (!currentUserId) {
        setUserChats([]);
        setLoadingChat(false);
        return;
      }

      try {
        const chatsData = await getUserChatsWithDetails(currentUserId);
        const mappedChats = chatsData.map(mapChatFromDB);
        setUserChats(mappedChats);
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoadingChat(false);
      }
    };

    loadChats();
  }, [currentUserId]);

  // Create a new chat
  const createChat = useCallback(async (participantIds: string[]) => {
    if (!currentUserId || !participantIds.includes(currentUserId)) {
      return null;
    }

    try {
      const chatId = `chat${Date.now()}`;

      // Insert new chat
      await db.insert(chatsSchema).values({
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
      };

      setUserChats(prevChats => [...prevChats, newChat]);
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  }, [currentUserId]);

  return {
    chats: userChats,
    createChat,
    loadingChats,
  };
} 
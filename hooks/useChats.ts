import { useState, useEffect, useCallback } from 'react';
import { db } from '../database/db';
import { chats as chatsSchema, chatParticipants, messages } from '../database/schema';
import { eq, desc } from 'drizzle-orm';
import { Message } from './useChatRoomMessage';
import { useAuthContext } from '@/contexts/AuthContext';

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
}

export function useChats() {
  const { currentUser, userLoading } = useAuthContext();
  const currentUserId = !userLoading ? currentUser?.id || null : null;
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChat] = useState(true);

  // Load chats for the current user
  useEffect(() => {
    const loadChats = async () => {
      if (!currentUserId) {
        setUserChats([]);
        setLoadingChat(false);
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
          setLoadingChat(false);
          return;
        }
        
        // Build the complete chat objects
        const loadedChats: Chat[] = [];
        
        for (const chatId of chatIds) {
          // Get the chat
          const chatData = await db
            .select()
            .from(chatsSchema)
            .where(eq(chatsSchema.id, chatId));
            
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
            .orderBy(desc(messages.timestamp))
            .limit(1);
            
          const chatMessages = messagesData.map(m => {
            let readBy: string[] = [];
            try {
              readBy = JSON.parse(m.readBy || '[]');
            } catch (error) {
              console.warn('Error parsing readBy for message:', m.id, error);
              readBy = [];
            }
            
            return {
              id: m.id,
              senderId: m.senderId,
              chatId: m.chatId,
              text: m.text,
              timestamp: m.timestamp,
              status: m.status || 'sent',
              readBy,
              isEdited: m.isEdited || false,
              isDeleted: m.isDeleted || false,
              editedAt: m.editedAt || undefined,
              deletedAt: m.deletedAt || undefined,
              originalText: m.originalText || undefined,
            };
          });
          
          // Determine last message
          const lastMessage = chatMessages.length > 0 
            ? chatMessages[chatMessages.length - 1] 
            : undefined;
          
          loadedChats.push({
            id: chatId,
            participants: participantIds,
            lastMessage,
          });
        }
        setUserChats(loadedChats);
        setLoadingChat(false);
      } catch (error) {
        console.error('Error loading chats:', error);
        setLoadingChat(false);
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
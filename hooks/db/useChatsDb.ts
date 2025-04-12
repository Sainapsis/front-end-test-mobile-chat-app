import { useState, useEffect, useCallback } from 'react';
import { db } from '../../database/db';
import { chats, chatParticipants, messages } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  timestamp: number;
  delivery_status: 'sending' | 'sent' | 'delivered' | 'read';
  is_read: boolean;
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
        
        // Build the complete chat objects
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
            .orderBy(messages.timestamp);
            
          const chatMessages = messagesData.map(m => ({
            id: m.id,
            senderId: m.senderId,
            text: m.text,
            imageUrl: m.imageUrl || undefined,
            timestamp: m.timestamp,
            delivery_status: m.deliveryStatus as Message['delivery_status'],
            is_read: m.isRead === 1,
          }));
          
          // Determine last message
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

  const sendMessage = useCallback(async (chatId: string, text: string, senderId: string, imageUrl?: string) => {
    if (!text.trim() && !imageUrl) return false;
    
    try {
      const messageId = `msg${Date.now()}`;
      const timestamp = Date.now();
      
      // Insert new message with initial delivery status
      await db.insert(messages).values({
        id: messageId,
        chatId: chatId,
        senderId: senderId,
        text: text,
        imageUrl: imageUrl,
        timestamp: timestamp,
        deliveryStatus: 'sending',
        isRead: 0,
      });
      
      const newMessage: Message = {
        id: messageId,
        senderId,
        text,
        imageUrl,
        timestamp,
        delivery_status: 'sending',
        is_read: false,
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

      // Simulate message delivery
      setTimeout(async () => {
        await db.update(messages)
          .set({ deliveryStatus: 'sent' })
          .where(eq(messages.id, messageId));

        setUserChats(prevChats => {
          return prevChats.map(chat => {
            if (chat.id === chatId) {
              const updatedMessages = chat.messages.map(msg => 
                msg.id === messageId 
                  ? { ...msg, delivery_status: 'delivered' as const }
                  : msg
              );
              return {
                ...chat,
                messages: updatedMessages,
                lastMessage: chat.lastMessage?.id === messageId
                  ? { ...chat.lastMessage, delivery_status: 'delivered' as const }
                  : chat.lastMessage,
              };
            }
            return chat;
          });
        });
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, []);

  const markMessagesAsRead = useCallback(async (chatId: string, userId: string) => {
    try {
      // Update all messages in the database that were sent by the other user
      await db.update(messages)
        .set({ 
          isRead: 1,
          deliveryStatus: 'read'
        })
        .where(
          and(
            eq(messages.chatId, chatId),
            eq(messages.senderId, userId)
          )
        );

      // Update the local state
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === chatId) {
            const updatedMessages = chat.messages.map(msg => {
              if (msg.senderId === userId) {
                return {
                  ...msg,
                  is_read: true,
                  delivery_status: 'read' as const,
                };
              }
              return msg;
            });

            return {
              ...chat,
              messages: updatedMessages,
              lastMessage: chat.lastMessage?.senderId === userId
                ? {
                    ...chat.lastMessage,
                    is_read: true,
                    delivery_status: 'read' as const,
                  }
                : chat.lastMessage,
            };
          }
          return chat;
        });
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, []);

  return {
    chats: userChats,
    createChat,
    sendMessage,
    markMessagesAsRead,
    loading,
  };
} 
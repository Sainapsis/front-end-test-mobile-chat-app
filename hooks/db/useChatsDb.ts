import { useState, useEffect, useCallback } from 'react';
import { db } from '../../database/db';
import { chats, chatParticipants, messages } from '../../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { MediaAttachment, Message, Chat } from '@/types/types';

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
            timestamp: m.timestamp,
            status: m.status || 'sent', // Default
            readBy: m.readBy ? JSON.parse(m.readBy.toString()) : [],
            reaction: m.reaction || undefined,
            media: m.media ? JSON.parse(m.media.toString()) : undefined
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

  const sendMessage = useCallback(async (chatId: string, text: string, senderId: string, media: MediaAttachment[] = []) => {
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
        status: 'sent',
        readBy: [JSON.stringify([senderId])],
        media: JSON.stringify(media)
      });
      
      const newMessage: Message = {
        id: messageId,
        senderId,
        text,
        timestamp,
        status: 'sent',
        readBy: [senderId],
        media: media
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

  // TODO: Fix possible carreer conditions
  const updateMessageStatus = useCallback(async (
    chatId: string,
    messageId: string,
    status: 'delivered' | 'read',
    userId?: string
  ) => {
    try {
      const lastMessage = await db.select()
        .from(messages)
        .where(
          eq(messages.chatId, chatId)
        )
        .orderBy(
          desc(messages.timestamp)
        )
        .limit(1);

      if (lastMessage[0]?.id !== messageId) {
        console.log('Not the last message, skipping update');
        return false;
      }

      // Obtener el mensaje actual
      const [currentMessage] = await db
        .select()
        .from(messages)
        .where(and(
          eq(messages.chatId, chatId),
          eq(messages.id, messageId)
        ))
  
      // Preparar datos de actualización
      const updateData: Record<string, any> = { status };
      
      // Manejar readBy como string JSON
      if (status === 'read' && userId) {
        const existingReadBy = currentMessage?.readBy 
          ? JSON.parse(currentMessage.readBy.toString())
          : [];
        
        if (!existingReadBy.includes(userId)) {
          updateData.readBy = JSON.stringify([...existingReadBy, userId]);
        }
      }
  
      // Actualizar en la base de datos
      await db.update(messages)
        .set(updateData)
        .where(and(
          eq(messages.chatId, chatId),
          eq(messages.id, messageId)
        ));
  
      // Actualizar estado local
      setUserChats(prevChats => prevChats.map(chat => {
        if (chat.id !== chatId) return chat;
        
        const updatedMessages = chat.messages.map(msg => {
          if (msg.id !== messageId) return msg;
          
          // Mantener todas las propiedades existentes del mensaje
          const updatedMsg = {
            ...msg,
            status,
            readBy: status === 'read' && userId 
              ? [...(msg.readBy || []), userId]
              : msg.readBy
          };
          
          return updatedMsg;
        });
        
        return {
          ...chat,
          messages: updatedMessages,
          lastMessage: chat.lastMessage?.id === messageId
            ? updatedMessages.find(m => m.id === messageId)
            : chat.lastMessage
        };
      }));
  
      return true;
    } catch (error) {
      console.error('Error updating message status:', error);
      return false;
    }
  }, []);

  const addReaction = useCallback(async (chatId: string, messageId: string, emoji: string) => {
    try {
      // Actualizar base de datos
      await db.update(messages)
        .set({ reaction: emoji })
        .where(and(
          eq(messages.chatId, chatId),
          eq(messages.id, messageId)
        ));

        setUserChats(prevChats => prevChats.map(chat => {
          if (chat.id !== chatId) return chat;
          return {
            ...chat,
            messages: chat.messages.map(msg => 
              msg.id === messageId ? { ...msg, reaction: emoji } : msg
            )
          };
        }));
  
      // Actualizar el estado local
      setUserChats(prevChats => prevChats.map(chat => {
        if (chat.id !== chatId) return chat;
        return {
          ...chat,
          messages: chat.messages.map(msg => 
            msg.id === messageId ? { ...msg, reaction: emoji } : msg
          )
        };
      }));
  
      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      return false;
    }
  }, []);

  const deleteMessage = useCallback(async (chatId: string, messageId: string) => {
    try {
      await db.update(messages)
        .set({ isDeleted: 1 })
        .where(and(
          eq(messages.chatId, chatId),
          eq(messages.id, messageId)
        ));
  
      setUserChats(prev => prev.map(chat => {
        if (chat.id !== chatId) return chat;
        return {
          ...chat,
          messages: chat.messages.filter(msg => msg.id !== messageId)
        };
      }));
  
      return true;
    } catch (error) {
      console.error("Error deleting message:", error);
      return false;
    }
  }, []);

  const editMessage = useCallback(async (chatId: string, messageId: string, newText: string) => {
    try {
      await db.update(messages)
        .set({ 
          text: newText,
          editedAt: Date.now() 
        })
        .where(and(
          eq(messages.chatId, chatId),
          eq(messages.id, messageId)
        ));
  
      setUserChats(prev => prev.map(chat => {
        if (chat.id !== chatId) return chat;
        return {
          ...chat,
          messages: chat.messages.map(msg => 
            msg.id === messageId 
              ? { ...msg, text: newText, editedAt: Date.now() }
              : msg
          )
        };
      }));
  
      return true;
    } catch (error) {
      console.error("Error editing message:", error);
      return false;
    }
  }, []);

  return {
    chats: userChats,
    createChat,
    sendMessage,
    updateMessageStatus,
    // Added methods
    addReaction,
    deleteMessage,
    editMessage,
    loading,
  };
} 
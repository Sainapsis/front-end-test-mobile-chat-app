import { useState, useEffect, useCallback } from 'react';
import { db } from '../../database/db';
import { chats, chatParticipants, messages } from '../../database/schema';
import { eq, and, ne, desc, sql } from 'drizzle-orm';
import { MediaAttachment, Message, Chat } from '@/types/types';

export function useChatsDb(currentUserId: string | null) {
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagePagination, setMessagePagination] = useState<Record<string, { page: number; hasMore: boolean }>>({});
  const MESSAGES_PER_PAGE = 20;

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
          
          // Get initial messages (most recent first)
          const messagesData = await db
            .select()
            .from(messages)
            .where(and(eq(messages.chatId, chatId), ne(messages.isDeleted, 1)))
            .orderBy(desc(messages.timestamp))
            .limit(MESSAGES_PER_PAGE);
            
          const chatMessages = messagesData.map(m => ({
            id: m.id,
            senderId: m.senderId,
            text: m.text,
            timestamp: m.timestamp,
            status: m.status as 'sent' | 'delivered' | 'read',
            readBy: m.readBy ? JSON.parse(m.readBy.toString()) : [],
            reaction: m.reaction || undefined,
            media: m.media ? JSON.parse(m.media.toString()) : undefined,
            editedAt: m.editedAt || undefined
          })).reverse(); // Reverse to show oldest first
          
          // Check if there are more messages
          const totalMessages = await db
            .select()
            .from(messages)
            .where(and(eq(messages.chatId, chatId), ne(messages.isDeleted, 1)))
            .then(rows => rows.length);
          
          const hasMore = totalMessages > MESSAGES_PER_PAGE;
          
          // Initialize pagination state for this chat
          setMessagePagination(prev => ({
            ...prev,
            [chatId]: { page: 1, hasMore }
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

  // Add new function to load more messages
  const loadMoreMessages = useCallback(async (chatId: string) => {
    const pagination = messagePagination[chatId];
    if (!pagination || !pagination.hasMore) return;

    try {
      const nextPage = pagination.page + 1;
      const offset = (nextPage - 1) * MESSAGES_PER_PAGE;

      const messagesData = await db
        .select()
        .from(messages)
        .where(and(
          eq(messages.chatId, chatId),
          ne(messages.isDeleted, 1),
          sql`1=1 LIMIT ${MESSAGES_PER_PAGE} OFFSET ${offset}`
        ))
        .orderBy(desc(messages.timestamp));

      const newMessages = messagesData.map(m => ({
        id: m.id,
        senderId: m.senderId,
        text: m.text,
        timestamp: m.timestamp,
        status: m.status as 'sent' | 'delivered' | 'read',
        readBy: m.readBy ? JSON.parse(m.readBy.toString()) : [],
        reaction: m.reaction || undefined,
        media: m.media ? JSON.parse(m.media.toString()) : undefined,
        editedAt: m.editedAt || undefined
      })).reverse();

      // Check if there are more messages
      const totalMessages = await db
        .select()
        .from(messages)
        .where(and(eq(messages.chatId, chatId), ne(messages.isDeleted, 1)))
        .then(rows => rows.length);

      const hasMore = totalMessages > nextPage * MESSAGES_PER_PAGE;

      // Update pagination state
      setMessagePagination(prev => ({
        ...prev,
        [chatId]: { page: nextPage, hasMore }
      }));

      // Update chat messages
      setUserChats(prevChats => 
        prevChats.map(chat => {
          if (chat.id !== chatId) return chat;
          return {
            ...chat,
            messages: [...newMessages, ...chat.messages]
          };
        })
      );
    } catch (error) {
      console.error('Error loading more messages:', error);
    }
  }, [messagePagination]);

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
    if (!text.trim() && media.length === 0) return false;
    
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
        readBy: JSON.stringify([senderId]),
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

  const updateMessageStatus = useCallback(async (
    chatId: string,
    status: 'delivered' | 'read',
    userId?: string
  ) => {
    try {
      if (status === 'delivered' && userId) {
        // Get all participants in the chat
        const participants = await db
          .select()
          .from(chatParticipants)
          .where(eq(chatParticipants.chatId, chatId));
        
        const participantIds = participants.map(p => p.userId);

        // Get all sent messages from other users
        const sentMessages = await db
          .select()
          .from(messages)
          .where(
            and(
              eq(messages.chatId, chatId),
              eq(messages.status, 'sent'),
              ne(messages.senderId, userId)
            )
          );

        // Update messages to delivered status
        for (const message of sentMessages) {
          let existingDeliveredTo: string[] = [];
          try {
            existingDeliveredTo = message.deliveredTo 
              ? JSON.parse(message.deliveredTo.toString())
              : [];
          } catch (error) {
            console.warn('Error parsing deliveredTo:', error);
            existingDeliveredTo = [];
          }
          
          // Add current user to deliveredTo array
          if (!existingDeliveredTo.includes(userId)) {
            const newDeliveredTo = [...existingDeliveredTo, userId];
            
            // Check if all participants (except sender) have received the message
            const allParticipantsReceived = participantIds
              .filter(id => id !== message.senderId)
              .every(id => newDeliveredTo.includes(id));
            
            await db
              .update(messages)
              .set({ 
                status: allParticipantsReceived ? 'delivered' : 'sent',
                deliveredTo: JSON.stringify(newDeliveredTo),
              })
              .where(eq(messages.id, message.id));
          }
        }

        // Update local state
        setUserChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id !== chatId) return chat;

            const updatedMessages = chat.messages.map((msg) => {
              if (msg.status === 'sent' && msg.senderId !== userId) {
                let currentDeliveredTo: string[] = [];
                try {
                  currentDeliveredTo = typeof msg.deliveredTo === 'string' 
                    ? JSON.parse(msg.deliveredTo) as string[]
                    : (msg.deliveredTo || []);
                } catch (error) {
                  console.warn('Error parsing deliveredTo in local state:', error);
                  currentDeliveredTo = [];
                }

                if (!currentDeliveredTo.includes(userId)) {
                  const newDeliveredTo = [...currentDeliveredTo, userId];
                  const allParticipantsReceived = chat.participants
                    .filter(id => id !== msg.senderId)
                    .every(id => newDeliveredTo.includes(id));

                  return {
                    ...msg,
                    status: allParticipantsReceived ? 'delivered' as const : 'sent' as const,
                    deliveredTo: newDeliveredTo
                  };
                }
              }
              return msg;
            });

            const lastMessage = updatedMessages.find(
              m => m.id === chat.lastMessage?.id
            ) || chat.lastMessage;

            return {
              ...chat,
              messages: updatedMessages,
              lastMessage
            };
          })
        );
      } else if (status === 'read' && userId) {
        // Get all unread messages from other users
        const unreadMessages = await db
          .select()
          .from(messages)
          .where(
            and(
              eq(messages.chatId, chatId),
              ne(messages.status, 'read'),
              ne(messages.senderId, userId)
            )
          );

        // Get all participants in the chat
        const participants = await db
          .select()
          .from(chatParticipants)
          .where(eq(chatParticipants.chatId, chatId));
        
        const participantIds = participants.map(p => p.userId);

        // Update all unread messages to read status
        for (const message of unreadMessages) {
          let existingReadBy: string[] = [];
          try {
            existingReadBy = message.readBy 
              ? JSON.parse(message.readBy.toString())
              : [];
          } catch (error) {
            console.warn('Error parsing readBy:', error);
            existingReadBy = [];
          }
          
          // Add current user to readBy array
          if (!existingReadBy.includes(userId)) {
            const newReadBy = [...existingReadBy, userId];
            
            // Check if all participants (except sender) have read the message
            const allParticipantsRead = participantIds
              .filter(id => id !== message.senderId)
              .every(id => newReadBy.includes(id));
            
            await db
              .update(messages)
              .set({ 
                status: allParticipantsRead ? 'read' : 'delivered',
                readBy: JSON.stringify(newReadBy),
              })
              .where(eq(messages.id, message.id));
          }
        }

        // Update local state
        setUserChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id !== chatId) return chat;

            const updatedMessages = chat.messages.map((msg) => {
              if (msg.senderId !== userId && msg.status !== 'read') {
                let currentReadBy: string[] = [];
                try {
                  currentReadBy = typeof msg.readBy === 'string' 
                    ? JSON.parse(msg.readBy) as string[]
                    : (msg.readBy || []);
                } catch (error) {
                  console.warn('Error parsing readBy in local state:', error);
                  currentReadBy = [];
                }

                if (!currentReadBy.includes(userId)) {
                  const newReadBy = [...currentReadBy, userId];
                  const allParticipantsRead = chat.participants
                    .filter(id => id !== msg.senderId)
                    .every(id => newReadBy.includes(id));

                  return {
                    ...msg,
                    status: allParticipantsRead ? 'read' as const : 'delivered' as const,
                    readBy: newReadBy
                  };
                }
              }
              return msg;
            });

            const lastMessage = updatedMessages.find(
              m => m.id === chat.lastMessage?.id
            ) || chat.lastMessage;

            return {
              ...chat,
              messages: updatedMessages,
              lastMessage
            };
          })
        );
      }
      return true;
    } catch (error) {
      console.error('Error updating message status:', error);
      return false;
    }
  }, []);

  const addReaction = useCallback(async (chatId: string, messageId: string, emoji: string) => {
    try {
      // Get current message to check existing reaction
      const currentMessage = await db
        .select()
        .from(messages)
        .where(and(
          eq(messages.chatId, chatId),
          eq(messages.id, messageId)
        ))
        .then(rows => rows[0]);

      // If the same emoji is selected, remove the reaction
      const newReaction = currentMessage?.reaction === emoji ? null : emoji;

      // Update database
      await db.update(messages)
        .set({ reaction: newReaction })
        .where(and(
          eq(messages.chatId, chatId),
          eq(messages.id, messageId)
        ));

      // Update local state
      setUserChats(prevChats => prevChats.map(chat => {
        if (chat.id !== chatId) return chat;
        return {
          ...chat,
          messages: chat.messages.map(msg => 
            msg.id === messageId ? { ...msg, reaction: newReaction } : msg
          )
        };
      }));
  
      return true;
    } catch (error) {
      console.error('Error adding/removing reaction:', error);
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
    addReaction,
    deleteMessage,
    editMessage,
    loading,
    loadMoreMessages,
  };
} 
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

  useEffect(() => {
    loadChats();
  }, [currentUserId]);

  // =================================================
  // Helper functions for loadChats
  // =================================================

const getUserChatIds = async (userId: string): Promise<string[]> => {
  try {
    const participantRows = await db
      .select({ chatId: chatParticipants.chatId })
      .from(chatParticipants)
      .where(eq(chatParticipants.userId, userId));
      
    return participantRows.map(row => row.chatId);
  } catch (error) {
      console.error('Error fetching user chat IDs');
    return [];
  }
};

const getChatData = async (chatId: string): Promise<any | null> => {
  try {
    const chatData = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatId));
      
    return chatData.length > 0 ? chatData[0] : null;
  } catch (error) {
      console.error(`Error fetching chat ${chatId}`);
    return null;
  }
};

const getChatParticipantIds = async (chatId: string): Promise<string[]> => {
  try {
    const participantsData = await db
      .select({ userId: chatParticipants.userId })
      .from(chatParticipants)
      .where(eq(chatParticipants.chatId, chatId));
      
    return participantsData.map(p => p.userId);
  } catch (error) {
      console.error(`Error fetching participants for chat ${chatId}`);
    return [];
  }
};

const getChatMessages = async (chatId: string, limit: number): Promise<Message[]> => {
  try {
    const messagesData = await db
      .select()
      .from(messages)
        .where(and(eq(messages.chatId, chatId), ne(messages.isDeleted, 1)))  // Dont show deleted messages
      .orderBy(desc(messages.timestamp))
      .limit(limit);
      
    return messagesData.map(m => ({
      id: m.id,
      senderId: m.senderId,
      text: m.text,
      timestamp: m.timestamp,
      status: m.status as 'sent' | 'delivered' | 'read',
      readBy: safeParseArray(m.readBy),
      deliveredTo: safeParseArray(m.deliveredTo),
      reaction: m.reaction || undefined,
      media: m.media ? JSON.parse(m.media.toString()) : undefined,
      editedAt: m.editedAt || undefined
    })).reverse(); // Reverse to show oldest first
  } catch (error) {
      console.error(`Error fetching messages for chat ${chatId}`);
    return [];
  }
};

const getMessageCount = async (chatId: string): Promise<number> => {
  try {
    const totalMessages = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(and(eq(messages.chatId, chatId), ne(messages.isDeleted, 1)))
      .then(rows => rows[0]?.count || 0);
    
    return totalMessages;
  } catch (error) {
      console.error(`Error counting messages for chat ${chatId}`);
    return 0;
  }
};

  const transformChatData = async (chatId: string, chatData: any): Promise<Chat | null> => {
      if (!chatData) return null;
      
      const [participantIds, chatMessages, totalMessages] = await Promise.all([
        getChatParticipantIds(chatId),
        getChatMessages(chatId, MESSAGES_PER_PAGE),
        getMessageCount(chatId)
      ]);
      
      const hasMore = totalMessages > MESSAGES_PER_PAGE;
      
      setMessagePagination(prev => ({
        ...prev,
        [chatId]: { page: 1, hasMore }
      }));
      
      const lastMessage = chatMessages.length > 0 
        ? chatMessages[chatMessages.length - 1] 
        : undefined;
      
      return {
        id: chatId,
        participants: participantIds,
        messages: chatMessages,
        lastMessage,
      } as Chat;
  };

  // Load all chats for the current user
  const loadChats = async () => {
    if (!currentUserId) {
      setUserChats([]);
      setLoading(false);
      return;
    }
    
    try {
      const chatIds = await getUserChatIds(currentUserId);
      
      if (chatIds.length === 0) {
        setUserChats([]);
        setLoading(false);
        return;
      }
      
      const chatPromises = chatIds.map(async (chatId) => {
        const chatData = await getChatData(chatId);
        return await transformChatData(chatId, chatData);
    });
    
    const loadedChats = (await Promise.all(chatPromises)).filter(Boolean) as Chat[];
    setUserChats(loadedChats);
  } catch (error) {
      console.error('Error loading chats');
  } finally {
    setLoading(false);
  }
};

  // =================================================
  // Helper functions for loadMoreMessages
  // =================================================

const fetchPaginatedMessages = async (
  chatId: string,
  page: number,
  messagesPerPage: number
): Promise<Message[]> => {
  try {
    const offset = (page - 1) * messagesPerPage;
    
    const messagesData = await db
      .select()
      .from(messages)
        .where(and(eq(messages.chatId, chatId), ne(messages.isDeleted, 1)))
      .orderBy(desc(messages.timestamp))
      .limit(messagesPerPage)
      .offset(offset);
    
    return messagesData.map(m => ({
      id: m.id,
      senderId: m.senderId,
      text: m.text,
      timestamp: m.timestamp,
      status: m.status as 'sent' | 'delivered' | 'read',
      readBy: safeParseArray(m.readBy),
      deliveredTo: safeParseArray(m.deliveredTo),
      reaction: m.reaction || undefined,
      media: m.media ? JSON.parse(m.media.toString()) : undefined,
      editedAt: m.editedAt || undefined
        })).reverse();
      } catch (error) {
      console.error(`Error fetching paginated messages for chat ${chatId}`);
        return [];
      }
    };

    const loadMoreMessages = useCallback(async (chatId: string) => {
      const pagination = messagePagination[chatId];
      if (!pagination || !pagination.hasMore) return;

      try {
        const nextPage = pagination.page + 1;
        
        const newMessages = await fetchPaginatedMessages(chatId, nextPage, MESSAGES_PER_PAGE);
        
        if (newMessages.length === 0) {
          setMessagePagination(prev => ({
          ...prev, [chatId]: { ...pagination, hasMore: false }
          }));
          return;
        }
        
        const totalMessages = await getMessageCount(chatId);
        const hasMore = totalMessages > nextPage * MESSAGES_PER_PAGE;

        setMessagePagination(prev => ({
          ...prev,
          [chatId]: { page: nextPage, hasMore }
        }));

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
      console.error('Error loading more messages');
      }
    }, [messagePagination]);

  const createChat = useCallback(async (participantIds: string[]) => {
    if (!currentUserId || !participantIds.includes(currentUserId)) {
      return null;
    }
    
    try {
      const chatId = `chat${Date.now()}`;
      
      await db.insert(chats).values({
        id: chatId,
      });
      
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
      console.error('Error creating chat');
      return null;
    }
  }, [currentUserId]);

  const sendMessage = useCallback(async (chatId: string, text: string, senderId: string, media: MediaAttachment[] = []) => {
    if (!text.trim() && media.length === 0) return false;
    
    try {
      const messageId = `msg${Date.now()}`;
      const timestamp = Date.now();

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
      console.error('Error sending message');
      return false;
    }
  }, []);

  // =================================================
  // Helper functions for updateMessageStatus
  // =================================================

const safeParseArray = (jsonString: unknown): string[] => {
  if (!jsonString) return [];
  
  try {
    return typeof jsonString === 'string' 
      ? JSON.parse(jsonString) as string[]
      : (Array.isArray(jsonString) ? jsonString : []);
  } catch (error) {
      console.error('Error parsing JSON array:');
    return [];
  }
};

// Function to get ONLY participant IDs
const fetchParticipantIds = async (chatId: string): Promise<string[]> => {
  try {
    const participantRows = await db
      .select({ userId: chatParticipants.userId })
      .from(chatParticipants)
      .where(eq(chatParticipants.chatId, chatId));
    
    return participantRows.map(row => row.userId);
  } catch (error) {
      console.error('Error fetching participant IDs');
    return [];
  }
};

const updateMessageStatusInDb = useCallback(async (
chatId: string, 
userId: string, 
  participantIds: string[],
  status: 'delivered' | 'read'
): Promise<void> => {
  const fieldToUpdate = status === 'delivered' ? 'deliveredTo' : 'readBy';
  const statusToCheck = status === 'delivered' ? 'sent' : ['sent', 'delivered'];
  
  const messagesToUpdate = await db
  .select()
  .from(messages)
  .where(
    and(
      eq(messages.chatId, chatId),
        Array.isArray(statusToCheck) 
          ? sql`${messages.status} IN (${statusToCheck.join(',')})` 
          : eq(messages.status, statusToCheck),
        ne(messages.senderId, userId) // Not my messages
      )
    );

  await Promise.all(messagesToUpdate.map(async (message) => {
    const existingStatusArray = safeParseArray(message[fieldToUpdate]);
    
    if (existingStatusArray.includes(userId)) {
      return;
    }
    
    const newStatusArray = [...existingStatusArray, userId];
    
    const allParticipantsUpdated = participantIds
    .filter(id => id !== message.senderId)
      .every(id => newStatusArray.includes(id));
    
    const newStatus = status === 'delivered'
      ? (allParticipantsUpdated ? 'delivered' : 'sent')
      : (allParticipantsUpdated ? 'read' : 'delivered');
    
  return db
    .update(messages)
    .set({ 
        status: newStatus,
        [fieldToUpdate]: JSON.stringify(newStatusArray),
    })
    .where(eq(messages.id, message.id));
  }));
  }, []);

  const updateMessageInLocalState = useCallback((
    message: Message,
    userId: string, 
    status: 'delivered' | 'read',
    allParticipants: string[]
  ): Message => {
    if ((status === 'delivered' && message.status !== 'sent') || 
        message.senderId === userId ||
        (status === 'read' && message.status === 'read')) {
      return message;
    }

    if (status === 'delivered') {
      const deliveredTo = [...(message.deliveredTo || [])];
      
      if (!deliveredTo.includes(userId)) {
        deliveredTo.push(userId);
        const allReceived = allParticipants
          .filter(id => id !== message.senderId)
          .every(id => deliveredTo.includes(id));
            
        return {
          ...message,
          status: allReceived ? 'delivered' : 'sent',
          deliveredTo
        };
      }
    } else {
      const readBy = [...(message.readBy || [])];
      
      if (!readBy.includes(userId)) {
        readBy.push(userId);
        const allRead = allParticipants
      .filter(id => id !== message.senderId)
          .every(id => readBy.includes(id));
            
        return {
          ...message,
          status: allRead ? 'read' : 'delivered',
          readBy
        };
      }
    }
    
    return message;
  }, []);

const updateLocalChatState = useCallback((
  chatId: string, 
  status: 'delivered' | 'read',
  userId: string
): void => {
  setUserChats((prevChats) =>
    prevChats.map((chat) => {
      if (chat.id !== chatId) return chat;

        const updatedMessages = chat.messages.map((msg) => 
          updateMessageInLocalState(msg, userId, status, chat.participants)
        );

        const lastMessage = chat.lastMessage 
          ? updatedMessages.find(m => m.id === chat.lastMessage?.id) || chat.lastMessage
          : undefined;

      return {
        ...chat,
        messages: updatedMessages,
        lastMessage
      };
    })
  );
}, [updateMessageInLocalState]);

  // Main function to update message status
const updateMessageStatus = useCallback(async (
  chatId: string,
  status: 'delivered' | 'read',
  userId?: string
) => {
  try {
    if (!userId) return false;

    const participantIds = await fetchParticipantIds(chatId);
    
    if (participantIds.length === 0) {
      console.warn('No participants found for chat:', chatId);
      return false;
    }

      await updateMessageStatusInDb(chatId, userId, participantIds, status);

      updateLocalChatState(chatId, status, userId);
    
    return true;
  } catch (error) {
      console.error(`Error updating message ${status} status`);
    return false;
  }
  }, [updateMessageStatusInDb, updateLocalChatState, fetchParticipantIds]);

  const addReaction = useCallback(async (chatId: string, messageId: string, emoji: string) => {
    try {
      const currentMessage = await db
        .select()
        .from(messages)
        .where(and(
          eq(messages.chatId, chatId),
          eq(messages.id, messageId)
        ))
        .then(rows => rows[0]);

      const newReaction = currentMessage?.reaction === emoji ? null : emoji;

      await db.update(messages)
        .set({ reaction: newReaction })
        .where(and(
          eq(messages.chatId, chatId),
          eq(messages.id, messageId)
        ));

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
      console.error('Error adding/removing reaction');
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
      console.error("Error deleting message");
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
      console.error("Error editing message");
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
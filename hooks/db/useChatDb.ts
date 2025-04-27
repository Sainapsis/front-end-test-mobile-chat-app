import { useState, useCallback, useEffect } from 'react';
import { db } from '../../database/db';
import { chats, messages } from '../../database/schema';
import { eq, desc } from 'drizzle-orm';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  reaction?: string;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
}

export function useChatDb(chatId: string | null) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);

  // Load a specific chat
  const loadChat = useCallback(async () => {
    if (!chatId) {
      setChat(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch chat data
      const chatData = await db
        .select()
        .from(chats)
        .where(eq(chats.id, chatId));

      if (chatData.length === 0) {
        setChat(null);
        setLoading(false);
        return;
      }

      // Fetch messages for the chat
      const messagesData = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, chatId))
        .orderBy(desc(messages.timestamp));

      const chatMessages = messagesData.map(m => ({
        id: m.id,
        senderId: m.senderId,
        text: m.text,
        timestamp: m.timestamp,
        reaction: m.reaction ?? undefined,
      }));

      setChat({
        id: chatId,
        participants: [], // Add participants if needed
        messages: chatMessages,
        lastMessage: chatMessages[0] || undefined,
      });
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  const updateMessage = useCallback(async (messageId: string, updates: Partial<Message>) => {
    if (!chatId) return false;
  
    try {
      await db.update(messages).set(updates).where(eq(messages.id, messageId));
  
      setChat(prevChat => {
        if (!prevChat) return null;
  
        const updatedMessages = prevChat.messages.map(message =>
          message.id === messageId ? { ...message, ...updates } : message
        );
  
        return {
          ...prevChat,
          messages: updatedMessages,
          lastMessage:
            prevChat.lastMessage?.id === messageId
              ? { ...prevChat.lastMessage, ...updates }
              : prevChat.lastMessage,
        };
      });
  
      return true;
    } catch (error) {
      console.error('Error updating message:', error);
      return false;
    }
  }, [chatId]);
  
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!chatId) return false;
  
    try {
      await db.delete(messages).where(eq(messages.id, messageId));
  
      setChat(prevChat => {
        if (!prevChat) return null;
  
        const updatedMessages = prevChat.messages.filter(message => message.id !== messageId);
        const lastMessage = updatedMessages[0] || undefined;
  
        return {
          ...prevChat,
          messages: updatedMessages,
          lastMessage,
        };
      });
  
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
    }, [chatId]);

  return {
    chat,
    loading,
    loadChat,
    updateMessage,
    deleteMessage,
  };
}
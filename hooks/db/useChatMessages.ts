import { useState, useCallback } from 'react';
import { db } from '../../database/db';
import { messages } from '../../database/schema';
import { eq } from 'drizzle-orm';
import type { Message } from './useChatsDb';

export function useChatMessages(chatId: string) {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  const loadMessagesForChat = useCallback(async () => {
    try {
      const messagesData = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, chatId))
        .orderBy(messages.timestamp);

      const loadedMessages = messagesData.map(m => ({
        id: m.id,
        senderId: m.senderId,
        text: m.text,
        timestamp: m.timestamp,
      }));

      setChatMessages(loadedMessages);
      return loadedMessages; // Devuelve los mensajes si quieres usarlos directamente
    } catch (error) {
      console.error('Error loading messages for chat:', error);
      setChatMessages([]);
      return [];
    } finally {
    }
  }, [chatId]);

  return { chatMessages, loadMessagesForChat,};
}
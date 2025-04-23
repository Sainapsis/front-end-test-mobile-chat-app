import { useCallback, useState, useEffect } from 'react';
import { db } from '../../database/db';
import { messages } from '../../database/schema';
import { eq, desc } from 'drizzle-orm';
import { useSync } from '../useSync';
import { api } from '../../services/apiMocks';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export function useMessages(chatId: string) {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline, createPendingOperation } = useSync();

  // Fetch messages from the database
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get local messages from database
      const dbMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, chatId))
        .orderBy(desc(messages.timestamp));
      
      setChatMessages(dbMessages);
      
      // If we're online, try to sync with server
      if (isOnline) {
        try {
          // Find the latest message to use as the sync timestamp
          const lastMessage = dbMessages[0];
          const lastTimestamp = lastMessage ? lastMessage.timestamp : 0;
          
          // Get new messages from the "server" since last sync
          const response = await api.messages.sync(chatId, lastTimestamp);
          
          // If there are new messages from the server
          if (response.messages && response.messages.length > 0) {
            console.log(`Syncing ${response.messages.length} new messages from server`);
            
            // Add new server messages to local DB
            for (const newMessage of response.messages) {
              await db.insert(messages).values(newMessage).onConflictDoNothing();
            }
            
            // Refresh the messages list from the updated local DB
            const updatedMessages = await db
              .select()
              .from(messages)
              .where(eq(messages.chatId, chatId))
              .orderBy(desc(messages.timestamp));
            
            setChatMessages(updatedMessages);
          }
        } catch (error) {
          console.error('Error syncing messages:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId, isOnline]);

  // Load messages when the component mounts or chatId changes
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages, chatId]);

  // Send a new message
  const sendMessage = useCallback(async (text: string, senderId: string): Promise<boolean> => {
    try {
      // Create a new message object
      const newMessage: typeof messages.$inferInsert = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        chatId,
        senderId,
        text,
        timestamp: Date.now()
      };
      
      // Always save to local database first (offline-first approach)
      await db.insert(messages).values(newMessage);
      
      // Refresh messages list to show immediately
      await fetchMessages();
      
      // If online, send to mock server
      if (isOnline) {
        try {
          // Send to "server" (stores in Map and AsyncStorage)
          await api.messages.send(newMessage);
          console.log('Message sent to server successfully');
        } catch (error) {
          console.error('Error sending message to server:', error);
          // Save as pending operation to try again later
          await createPendingOperation({
            type: 'create',
            resource: 'message',
            data: newMessage
          });
        }
      } else {
        console.log('Offline - saving message as pending operation');
        // Create pending operation if offline
        await createPendingOperation({
          type: 'create',
          resource: 'message',
          data: newMessage
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [chatId, fetchMessages, isOnline, createPendingOperation]);

  return {
    messages: chatMessages,
    loading,
    sendMessage,
    refreshMessages: fetchMessages
  };
} 
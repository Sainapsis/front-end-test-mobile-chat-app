import { useCallback, useEffect, useState } from "react";
import { db } from '../database/db';
import { messages as messageSchema } from "@/database/schema";
import { eq } from "drizzle-orm";
import { MESSAGE_STATUS } from "@/constants/messageStatus";
import { MessageStatus } from "@/components/messages/MessageStatus";
import { useAuthContext } from "@/contexts/AuthContext";
import { mapMessageFromDB } from "@/utils/chatMappers";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: number;
  status: MessageStatus;
  readBy: string[];
  isEdited: boolean;
  isDeleted: boolean;
  editedAt?: number;
  deletedAt?: number;
  originalText?: string;
}

export function useChatRoomMessage(chatId: string) {
  const { currentUser, userLoading } = useAuthContext();
  const currentUserId = !userLoading ? currentUser?.id || null : null;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Fetch messages for the current chat
  const fetchMessages = useCallback(async () => {
    if (!chatId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    try {
      const messagesData = await db.select().from(messageSchema)
        .where(eq(messageSchema.chatId, chatId)).limit(100);
      if (messagesData.length === 0) {
        setMessages([]);
        setLoadingMessages(false);
        return;
      }
      // Map the messages to the Message type
      const chatMessages = messagesData.map(mapMessageFromDB);

      setMessages(chatMessages);
      setLoadingMessages(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [chatId]);

  // Effect to fetch messages when the chatId changes
  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  // Function to mark a message as read
  const markMessageAsRead = useCallback(async (messageId: string, userId: string) => {
    try {
      console.debug('message as read:', messages);
      const message = messages.find(m => m.id === messageId);
      if (!message) {
        console.warn('Message not found:', messageId);
        return false;
      }

      if (!message.readBy?.includes(userId)) {
        message.readBy?.push(userId);
      }

      await db
        .update(messageSchema)
        .set({
          status: MESSAGE_STATUS.READ,
          readBy: JSON.stringify(message.readBy),
        })
        .where(eq(messageSchema.id, messageId));

      // Update state
      setMessages(prevMessage => {
        return prevMessage.map(msg => {
          if (msg.id === messageId) {
            return {
              ...msg,
              status: MESSAGE_STATUS.READ,
              readBy: message.readBy
            };
          }
          return msg;
        })
      });
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }, [currentUser]);

  // Function to send a message
  const sendMessage = useCallback(async (chatId: string, text: string, senderId: string) => {
    if (!text.trim()) return false;

    try {
      const messageId = `msg${Date.now()}`;
      const timestamp = Date.now();

      // Insert new message
      await db.insert(messageSchema).values({
        id: messageId,
        chatId: chatId,
        senderId: senderId,
        text: text,
        timestamp: timestamp,
        status: MESSAGE_STATUS.SENT,
        readBy: JSON.stringify([senderId]), // The sender has always read his own message.
        originalText: text,
      });

      const newMessage: Message = {
        id: messageId,
        chatId: chatId,
        senderId,
        text,
        timestamp,
        status: MESSAGE_STATUS.SENT,
        readBy: [senderId],
        isEdited: false,
        isDeleted: false,
      };

      // Update state
      setMessages(prevMessages => [...prevMessages, newMessage]);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, []);

  // Function to edit a message
  const editMessage = useCallback(async (messageId: string, newText: string, userSenderId: string) => {
    try {
      const message = db
        .select()
        .from(messageSchema)
        .where(eq(messageSchema.id, messageId)).get()

      if (!message) return false;

      // Only allow editing of own messages
      if (message.senderId !== userSenderId) return false;

      // Do not allow editing deleted messages
      if (message.isDeleted) return false;

      // Time limit for editing (1 hour)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      if (message.timestamp < oneHourAgo) return false;

      await db
        .update(messageSchema)
        .set({
          text: newText,
          isEdited: true,
          editedAt: Date.now(),
          originalText: message.text,
        })
        .where(eq(messageSchema.id, messageId));

      // Update state
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.id === messageId) {
            return {
              ...msg,
              text: newText,
              isEdited: true,
              editedAt: Date.now(),
            };
          }
          return msg;
        });
      });

      return true;
    } catch (error) {
      console.error('Error editing message:', error);
      return false;
    }
  }, [currentUser]);

  // Function to delete a message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      console.debug('Deleting message:', messageId);
      const message = db
        .select()
        .from(messageSchema)
        .where(eq(messageSchema.id, messageId))
        .get();

      if (!message) return false;

      // Only allow deleting own messages
      if (message.senderId !== currentUserId) return false;

      await db
        .update(messageSchema)
        .set({
          isDeleted: true,
          deletedAt: Date.now(),
        })
        .where(eq(messageSchema.id, messageId));

      // Update state
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.id === messageId) {
            return {
              ...msg,
              isDeleted: true,
              deletedAt: Date.now(),
            };
          }
          return msg;
        });
      });

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }, [currentUser]);

  return {
    messages,
    loadingMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    markMessageAsRead,
    refreshMessages: fetchMessages,
  };
}
import { useState, useEffect, useCallback } from 'react';
import { db } from '../../database/db';
import { chats, chatParticipants, messages, messageReadReceipts, messageReactions } from '../../database/schema';
import { eq, inArray } from 'drizzle-orm';

export interface MessageReaction {
  userId: string;
  emoji: string;
  timestamp: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  messageType: 'text' | 'image';
  imageUri?: string;
  imagePreviewUri?: string;
  status: 'sent' | 'delivered' | 'read';
  readBy?: { userId: string; timestamp: number }[];
  reactions: MessageReaction[];
  isEdited: boolean;
  editedAt?: number;
  isDeleted: boolean;
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

  useEffect(() => {
    if (!currentUserId) {
      setUserChats([]);
      setLoading(false);
      return;
    }

    const loadChats = async () => {
      try {
        // Get all chats where the current user is a participant
        const participantData = await db
          .select()
          .from(chatParticipants)
          .where(eq(chatParticipants.userId, currentUserId));

        const chatIds = participantData.map(p => p.chatId);
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

          // Get messages with read receipts
          const messagesData = await db
            .select()
            .from(messages)
            .where(eq(messages.chatId, chatId))
            .orderBy(messages.timestamp);

          // Get read receipts for all messages
          const messageIds = messagesData.map(m => m.id);
          const readReceiptsData = await db
            .select()
            .from(messageReadReceipts)
            .where(inArray(messageReadReceipts.messageId, messageIds));

          // Get reactions for all messages
          const reactionsData = await db
            .select()
            .from(messageReactions)
            .where(inArray(messageReactions.messageId, messageIds));

          // Group read receipts by message
          const readReceiptsByMessage = readReceiptsData.reduce((acc, receipt) => {
            if (!acc[receipt.messageId]) {
              acc[receipt.messageId] = [];
            }
            acc[receipt.messageId].push({
              userId: receipt.userId,
              timestamp: receipt.timestamp,
            });
            return acc;
          }, {} as Record<string, { userId: string; timestamp: number }[]>);

          // Group reactions by message
          const reactionsByMessage = reactionsData.reduce((acc, reaction) => {
            if (!acc[reaction.messageId]) {
              acc[reaction.messageId] = [];
            }
            acc[reaction.messageId].push({
              userId: reaction.userId,
              emoji: reaction.emoji,
              timestamp: reaction.timestamp,
            });
            return acc;
          }, {} as Record<string, MessageReaction[]>);

          const chatMessages = messagesData.map(m => ({
            id: m.id,
            senderId: m.senderId,
            text: m.text,
            timestamp: m.timestamp,
            messageType: m.messageType as 'text' | 'image',
            imageUri: m.imageUri || undefined,
            imagePreviewUri: m.imagePreviewUri || undefined,
            status: m.status as 'sent' | 'delivered' | 'read',
            readBy: readReceiptsByMessage[m.id] || [],
            reactions: reactionsByMessage[m.id] || [],
            isEdited: m.isEdited === 1,
            editedAt: m.editedAt || undefined,
            isDeleted: m.isDeleted === 1,
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
      // Check if a chat already exists between these participants
      const existingChats = userChats.filter(chat => {
        const chatParticipantIds = chat.participants;
        return participantIds.length === chatParticipantIds.length &&
          participantIds.every(id => chatParticipantIds.includes(id)) &&
          chatParticipantIds.every(id => participantIds.includes(id));
      });

      if (existingChats.length > 0) {
        return existingChats[0];
      }

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
      
      const newChat = {
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
  }, [currentUserId, userChats]);

  const markMessageAsRead = useCallback(async (messageId: string, userId: string) => {
    try {
      const receiptId = `receipt-${Date.now()}-${userId}`;
      const timestamp = Date.now();

      // Insert read receipt
      await db.insert(messageReadReceipts).values({
        id: receiptId,
        messageId,
        userId,
        timestamp,
      });

      // Update message status
      await db
        .update(messages)
        .set({ status: 'read' })
        .where(eq(messages.id, messageId));

      // Update state
      setUserChats(prevChats => {
        return prevChats.map(chat => ({
          ...chat,
          messages: chat.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                status: 'read' as const,
                readBy: [...(msg.readBy || []), { userId, timestamp }],
              };
            }
            return msg;
          }),
        }));
      });

      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }, []);

  const sendMessage = useCallback(async (
    chatId: string,
    text: string,
    senderId: string,
    imageData?: { uri: string; previewUri: string }
  ) => {
    if (!text.trim() && !imageData) return false;

    try {
      const messageId = `msg${Date.now()}`;
      const timestamp = Date.now();
      const messageType = imageData ? 'image' : 'text';

      // Insert new message
      await db.insert(messages).values({
        id: messageId,
        chatId: chatId,
        senderId: senderId,
        text: text,
        timestamp: timestamp,
        messageType: messageType,
        imageUri: imageData?.uri,
        imagePreviewUri: imageData?.previewUri,
        status: 'sent',
      });

      const newMessage: Message = {
        id: messageId,
        senderId,
        text,
        timestamp,
        messageType,
        imageUri: imageData?.uri,
        imagePreviewUri: imageData?.previewUri,
        status: 'sent',
        readBy: [],
        reactions: [],
        isEdited: false,
        editedAt: undefined,
        isDeleted: false,
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

  const addReaction = useCallback(async (messageId: string, userId: string, emoji: string) => {
    try {
      const reactionId = `reaction-${Date.now()}-${userId}`;
      const timestamp = Date.now();

      // Insert reaction
      await db.insert(messageReactions).values({
        id: reactionId,
        messageId,
        userId,
        emoji,
        timestamp,
      });

      // Update state
      setUserChats(prevChats => {
        return prevChats.map(chat => ({
          ...chat,
          messages: chat.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                reactions: [...msg.reactions, { userId, emoji, timestamp }],
              };
            }
            return msg;
          }),
        }));
      });

      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      return false;
    }
  }, []);

  const removeReaction = useCallback(async (messageId: string, userId: string, emoji: string) => {
    try {
      // Remove reaction
      await db
        .delete(messageReactions)
        .where(
          eq(messageReactions.messageId, messageId) &&
          eq(messageReactions.userId, userId) &&
          eq(messageReactions.emoji, emoji)
        );

      // Update state
      setUserChats(prevChats => {
        return prevChats.map(chat => ({
          ...chat,
          messages: chat.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                reactions: msg.reactions.filter(
                  r => !(r.userId === userId && r.emoji === emoji)
                ),
              };
            }
            return msg;
          }),
        }));
      });

      return true;
    } catch (error) {
      console.error('Error removing reaction:', error);
      return false;
    }
  }, []);

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    try {
      const timestamp = Date.now();

      // Update message
      await db
        .update(messages)
        .set({ 
          text: newText,
          isEdited: 1,
          editedAt: timestamp
        })
        .where(eq(messages.id, messageId));

      // Update state
      setUserChats(prevChats => {
        return prevChats.map(chat => ({
          ...chat,
          messages: chat.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                text: newText,
                isEdited: true,
                editedAt: timestamp
              };
            }
            return msg;
          }),
          lastMessage: chat.lastMessage?.id === messageId
            ? {
                ...chat.lastMessage,
                text: newText,
                isEdited: true,
                editedAt: timestamp
              }
            : chat.lastMessage
        }));
      });

      return true;
    } catch (error) {
      console.error('Error editing message:', error);
      return false;
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      // Mark message as deleted
      await db
        .update(messages)
        .set({ isDeleted: 1 })
        .where(eq(messages.id, messageId));

      // Update state
      setUserChats(prevChats => {
        return prevChats.map(chat => ({
          ...chat,
          messages: chat.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                isDeleted: true
              };
            }
            return msg;
          }),
          lastMessage: chat.lastMessage?.id === messageId
            ? {
                ...chat.lastMessage,
                isDeleted: true
              }
            : chat.lastMessage
        }));
      });

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }, []);

  return {
    chats: userChats,
    createChat,
    sendMessage,
    markMessageAsRead,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    loading,
  };
} 
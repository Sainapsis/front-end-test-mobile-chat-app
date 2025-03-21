import { useState, useEffect, useCallback } from 'react';
import { db } from '../../database/db';
import { chats, chatParticipants, messages, messagesReadBy } from '../../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
  unreadedMessagesCount: number;
}

export function useChatsDb(currentUserId: string | null) {
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Callback to change update trigger value
  const refreshChats = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

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
          const unreadedMessages = await db
            .select()
            .from(messagesReadBy)
            .where(and(eq(messagesReadBy.chatId, chatId), eq(messagesReadBy.readed, false), eq(messagesReadBy.userId, currentUserId)))

          const messagesData = await db
            .select()
            .from(messages)
            .where(eq(messages.chatId, chatId))
            .orderBy(messages.timestamp);

          const chatMessages = [];
          for (let message of messagesData) {
            let readed = true;
            const messagesReadByData = await db
              .select()
              .from(messagesReadBy)
              .where(and(eq(messagesReadBy.messageId, message.id), eq(messagesReadBy.readed, false)))
            if (messagesReadByData.length > 0) readed = false;
            chatMessages.push(
              {
                id: message.id,
                senderId: message.senderId,
                text: message.text,
                timestamp: message.timestamp,
                readed,
              }
            )
          }

          // Determine last message
          const lastMessage = chatMessages.length > 0
            ? chatMessages[chatMessages.length - 1]
            : undefined;

          loadedChats.push({
            id: chatId,
            participants: participantIds,
            messages: chatMessages,
            lastMessage,
            unreadedMessagesCount: unreadedMessages.length
          });
        }
        // Sort chats by timestamp
        loadedChats.sort((a, b) => {
          const timeA = a.lastMessage?.timestamp ?? 0;
          const timeB = b.lastMessage?.timestamp ?? 0;
          return timeB - timeA;
        });
        setUserChats(loadedChats);
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [currentUserId, updateTrigger]);

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
        unreadedMessagesCount: 0,
      };

      setUserChats(prevChats => [...prevChats, newChat]);
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  }, [currentUserId]);

  const sendMessage = useCallback(async (chatId: string, text: string, senderId: string) => {
    if (!text.trim()) return false;

    try {
      const messageId = `msg${Date.now()}`;
      const timestamp = Date.now();

      const participantsData = await db
        .select()
        .from(chatParticipants)
        .where(eq(chatParticipants.chatId, chatId));
      // Insert new message
      await db.insert(messages).values({
        id: messageId,
        chatId: chatId,
        senderId: senderId,
        text: text,
        timestamp: timestamp,
      });

      for (let participant of participantsData) {
        await db.insert(messagesReadBy).values({
          id: `mr-${messageId}-${participant.userId}`,
          messageId,
          userId: participant.userId,
          readed: participant.userId === senderId,
          chatId
        });
      }

      const newMessage: Message = {
        id: messageId,
        senderId,
        text,
        timestamp,
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
      refreshChats();
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [refreshChats]);

  const updateReadStatus = useCallback(async (userId: string, chatId: string) => {
    console.log("data updater")
    await db.update(messagesReadBy).set({ readed: true }).where(and(eq(messagesReadBy.chatId, chatId), eq(messagesReadBy.userId, userId), eq(messagesReadBy.readed, false))).execute();
    refreshChats();
  }, [])
  return {
    chats: userChats,
    createChat,
    sendMessage,
    loading,
    updateReadStatus
  };
} 
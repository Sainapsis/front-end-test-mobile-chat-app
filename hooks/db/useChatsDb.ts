import React, { createContext, useContext, ReactNode } from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/providers/database/db';
import { chats, chatParticipants, messages, users } from '@/providers/database/schema';
import { eq, and } from 'drizzle-orm';
import { User } from '@/hooks/user/useUser';
import { useApi } from '../api/useApi';
import * as SecureStore from 'expo-secure-store';
import { io, Socket } from 'socket.io-client';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text?: string;
  timestamp: number;
  responseText?: string;
  mediaUri?: string;
  readed?: number;
}

export interface Chat {
  id: string;
  lastMessage: string;
  chatName: string;
  lastMessageTime: number;
  unreadedMessages: number;
  lastMessageSender: string;
  chatStatus: string;
  messages?: Message[];
}

// Load the messages and determine their read status
// const loadChatMessages = async (chatId: string, currentUserId: string): Promise<{ messages: Message[]; lastMessage?: Message; unreadedCount: number }> => {
//   const messagesData = await db
//     .select()
//     .from(messages)
//     .where(eq(messages.chatId, chatId))
//     .orderBy(messages.timestamp);

//   // For each message, determine if it's read or not
//   // const messagesWithStatus: Message[] = await Promise.all(
//   //   messagesData.map(async (message) => {
//   //     // const unreadRows = await db
//   //     //   .select()
//   //     //   .from(messagesReadBy)
//   //     //   .where(and(eq(messagesReadBy.messageId, message.id), eq(messagesReadBy.readed, false)));
//   //     // return {
//   //     //   id: message.id,
//   //     //   senderId: message.senderId,
//   //     //   text: message.text,
//   //     //   timestamp: message.timestamp,
//   //     //   readed: unreadRows.length === 0,
//   //     // };
//   //   })
//   // );

//   // const lastMessage = messagesWithStatus.length > 0 ? messagesWithStatus[messagesWithStatus.length - 1] : undefined;
//   // Count the number of unread messages by user
//   // const unreadedCountRows = await db
//   //   .select()
//   //   .from(messagesReadBy)
//   //   .where(and(eq(messagesReadBy.chatId, chatId), eq(messagesReadBy.readed, false), eq(messagesReadBy.userId, currentUserId)));
//   // return { messages: messagesWithStatus, lastMessage, unreadedCount: 0 };
// }

export function useChatsDb(currentUserId: string | null) {
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const { post, get } = useApi();
  const socketRef = useRef<Socket | null>(null);

  // Sort the data by timestamp in descending order
  const orderByTimeStamp = async (data: any[], timestamp: string): Promise<any[]> => {
    return data.sort((a: any, b: any) => b[timestamp] - a[timestamp]);
  };

  const refreshChats = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  // Function to transform an API message into the Message format
  const transformMessage = (chat: any, message: any): Message => ({
    id: message._id,
    chatId: chat._id,
    senderId: message.sender._id,
    senderName: `${message.sender.firstName} ${message.sender.lastName}`,
    text: message.content,
    timestamp: Date.parse(message.timestamp),
    responseText: message.responseText ?? undefined,
    mediaUri: message.mediaUri ?? undefined,
    // Ensure that 'readed' is a number (0 or 1)
    readed: message.readed !== undefined ? (message.readed ? 1 : 0) : 0,
  });

  // Function to insert new messages into the database
  const storeNewMessages = async (chatId: string, messagesToStore: Message[]) => {
    // Get all message IDs that already exist for the chat
    const existingMessageIds = new Set(
      (
        await db
          .select({ id: messages.id })
          .from(messages)
          .where(eq(messages.chatId, chatId))
      ).map((msg) => msg.id)
    );
    // Filter the messages that are not yet in the DB
    const newMessages = messagesToStore.filter((msg) => !existingMessageIds.has(msg.id));
    if (newMessages.length > 0) {
      await db.insert(messages).values(newMessages);
    }
  };

  // Function to insert a chat into the database (if it doesn't exist)
  const storeChat = async (chatToStore: Chat) => {
    const existingChat = await db.select().from(chats).where(eq(chats.id, chatToStore.id));
    if (existingChat.length === 0) {
      await db.insert(chats).values({
        id: chatToStore.id,
        lastMessage: chatToStore.lastMessage,
        chatName: chatToStore.chatName,
        lastMessageTime: chatToStore.lastMessageTime,
        unreadedMessages: chatToStore.unreadedMessages,
        lastMessageSender: chatToStore.lastMessageSender,
        chatStatus: chatToStore.chatStatus,
      });
    }
  };

  // Function to process a chat received from the API.
  // Receives the chat and the currentUserId as parameters.
  const processChat = async (chat: any, currentUserId: string): Promise<Chat> => {
    const otherUser = chat.members.find((user: any) => user._id !== currentUserId);
    const myUser = chat.members.find((user: any) => user._id === currentUserId);

    // Get chat messages from the API
    const messagesFromAPI = await get(`/chat/${chat._id}/messages`);
    const messagesToStore: Message[] = messagesFromAPI.map((message: any) =>
      transformMessage(chat, message)
    );

    // Insert only the new messages into the DB
    await storeNewMessages(chat._id, messagesToStore);

    // Sort the messages by timestamp
    const orderedMessages = await orderByTimeStamp(messagesToStore, 'timestamp');

    // Build the Chat object
    const chatToStore: Chat = {
      id: chat._id,
      lastMessage: chat.lastMessage?.content ?? "",
      chatName: `${otherUser.firstName} ${otherUser.lastName}`,
      lastMessageTime: chat.lastMessage ? Date.parse(chat.lastMessage.timestamp) : 0,
      unreadedMessages: chat.unreadCounts[myUser._id] ?? 0,
      lastMessageSender: chat.lastMessage
        ? `${chat.lastMessage.sender.firstName} ${chat.lastMessage.sender.lastName}`
        : "",
      chatStatus: otherUser.status || 'offline',
      messages: orderedMessages,
    };

    // Store the chat in the database (if necessary)
    await storeChat(chatToStore);

    return chatToStore;
  };

  useEffect(() => {
    const loadChats = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        const chatsData = await get('/chat/getChats');

        // Process each chat in parallel, passing currentUserId as a parameter
        const chatPromises = chatsData.map((chat: any) => processChat(chat, currentUserId));
        const allChats = await Promise.all(chatPromises);
        const orderedChats = await orderByTimeStamp(allChats, "lastMessageTime");
        setUserChats(orderedChats);
      } catch (err) {
        console.error('Error loading chats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [currentUserId, updateTrigger]);

  useEffect(() => {
    console.log('currentUserId:', currentUserId);
    if (!currentUserId) return;
    
    const socket = io('http://localhost:3000/socket');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      if (currentUserId) {
        socket.emit('user:join', { userId: currentUserId });
      }
    });

    socket.on('chat:update', (data) => {
      console.log('Received chat:update', data);
      refreshChats();
    });
    socket.on('message:new', (data) => {
      console.log('Received message:new', data);
      refreshChats();
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  const createChat = useCallback(async (participantIds: string[]) => {
    // Uncomment and implement chat creation logic as needed
    // if (!currentUserId || !participantIds.includes(currentUserId)) {
    //   return null;
    // }

    // try {
    //   const chatId = `chat${Date.now()}`;
    //   // Insert new chat
    //   // await db.insert(chats).values({ id: chatId });
    //   // Insert participants
    //   await Promise.all(
    //     participantIds.map(userId =>
    //       db.insert(chatParticipants).values({
    //         id: `cp-${chatId}-${userId}`,
    //         chatId,
    //         userId,
    //       })
    //     )
    //   );
    //   const newChat: Chat = {
    //     id: chatId,
    //     participants: participantIds,
    //     messages: [],
    //     unreadedMessagesCount: 0,
    //   };
    //   setUserChats(prevChats => [...prevChats, newChat]);
    //   return newChat;
    // } catch (error) {
    //   console.error('Error creating chat:', error);
    //   return null;
    // }
  }, [currentUserId]);

  const sendMessage = useCallback(async (chatId: string, text: string, senderId: string) => {
    if (!text.trim()) return false;

    try {
      // Uncomment and implement message sending logic as needed
      // const messageId = `msg${Date.now()}`;
      // const timestamp = Date.now();

      // // Get chat participants
      // const participantsData = await db
      //   .select()
      //   .from(chatParticipants)
      //   .where(eq(chatParticipants.chatId, chatId));

      // Insert a message
      // await db.insert(messages).values({
      //   id: messageId,
      //   chatId,
      //   senderId,
      //   text,
      //   timestamp,
      // });

      // Insert the read status per participant
      // await Promise.all(
      //   participantsData.map(participant =>
      //     db.insert(messagesReadBy).values({
      //       id: `mr-${messageId}-${participant.userId}`,
      //       messageId,
      //       userId: participant.userId,
      //       readed: participant.userId === senderId,
      //       chatId,
      //     })
      //   )
      // );

      // const newMessage: Message = { id: messageId, senderId, text, timestamp };

      setUserChats(prevChats =>
        prevChats.map(chat => chat)
      );
      refreshChats();
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [refreshChats]);

  const updateReadStatus = useCallback(async (userId: string, chatId: string) => {
    try {
      // Uncomment and implement read status update logic as needed
      // await db.update(messagesReadBy)
      //   .set({ readed: true })
      //   .where(and(
      //     eq(messagesReadBy.chatId, chatId),
      //     eq(messagesReadBy.userId, userId),
      //     eq(messagesReadBy.readed, false)
      //   ))
      //   .execute();
      refreshChats();
    } catch (error) {
      console.error('Error updating read status:', error);
    }
  }, [refreshChats]);

  return {
    chats: userChats,
    createChat,
    sendMessage,
    loading,
    updateReadStatus,
    socket: socketRef.current,
  };
}

import React, { createContext, useContext, ReactNode } from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/providers/database/db';
import { chats, chatParticipants, messages, users } from '@/providers/database/schema';
import { eq, and, sql } from 'drizzle-orm';
import { User } from '@/hooks/user/useUser';
import { useApi } from '../api/useApi';
import * as SecureStore from 'expo-secure-store';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
  lastMessageSenderId: string,
  chatStatus: string;
  messages?: Message[];
}

export function useChatsDb(currentUserId: string | null) {
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { post, get } = useApi();
  const socketRef = useRef<Socket | null>(null);

  // Sort the data by timestamp in descending order
  const orderByTimeStamp = async (data: any[], timestamp: string, desc: boolean = false): Promise<any[]> => {
    return data.sort((a: any, b: any) => desc ? a[timestamp] - b[timestamp] : b[timestamp] - a[timestamp]);
  };

  // Function to transform an API message into the Message state format
  const transformMessageToDbFormat = (chat: any, message: any): Message => ({
    id: message._id,
    chatId: chat._id,
    senderId: message.sender._id,
    senderName: `${message.sender.firstName} ${message.sender.lastName}`,
    text: message.content,
    timestamp: Date.parse(message.timestamp),
    responseText: message.responseText ?? undefined,
    mediaUri: message.mediaUri ?? undefined,
    readed: message.readBy.length === chat.members.length ? 1 : 0,
  });

  const transformChatToDbFormat = (chat: any, otherUser: any, myUser: any): Chat => ({
    id: chat._id,
    lastMessage: chat.lastMessage?.content ?? "",
    chatName: `${otherUser.firstName} ${otherUser.lastName}`,
    lastMessageTime: chat.lastMessage ? Date.parse(chat.lastMessage.timestamp) : 0,
    unreadedMessages: chat.unreadCounts[myUser._id] ?? 0,
    lastMessageSender: chat.lastMessage
      ? `${chat.lastMessage.sender.firstName} ${chat.lastMessage.sender.lastName}`
      : "",
    lastMessageSenderId: chat.lastMessage
      ? chat.lastMessage.sender.senderId
      : "",
    chatStatus: otherUser.status || 'offline',
  })


  // Function to insert a chat into the database (if it doesn't exist)
  // const storeChatDb = async (chatToStore: Chat) => {
  //   await db.insert(chats).values({
  //     id: chatToStore.id,
  //     lastMessage: chatToStore.lastMessage,
  //     chatName: chatToStore.chatName,
  //     lastMessageTime: chatToStore.lastMessageTime,
  //     unreadedMessages: chatToStore.unreadedMessages,
  //     lastMessageSender: chatToStore.lastMessageSender,
  //     chatStatus: chatToStore.chatStatus,
  //   });
  // };

  // Function to process a chat received from the API.
  // Receives the chat and the currentUserId as parameters.
  const processChat = async (chat: any, currentUserId: string): Promise<Chat> => {
    const otherUser = chat.members.find((user: any) => user._id !== currentUserId);
    const myUser = chat.members.find((user: any) => user._id === currentUserId);

    // Get chat messages from the API
    const messagesFromAPI = await get(`/chat/${chat._id}/messages`);
    const messagesToStore: Message[] = messagesFromAPI.map((message: any) =>
      transformMessageToDbFormat(chat, message)
    );

    // Insert messages into the DB
    await db.insert(messages).values(messagesToStore).onConflictDoUpdate({
      target: messages.id,
      set: {
        chatId: sql`excluded.chat_id`,
        senderId: sql`excluded.sender_id`,
        senderName: sql`excluded.sender_name`,
        text: sql`excluded.text`,
        timestamp: sql`excluded.timestamp`,
        responseText: sql`excluded.response_text`,
        mediaUri: sql`excluded.media_uri`,
        readed: sql`excluded.readed`,
      }
    });

    const chatToStore: Chat = transformChatToDbFormat(chat, otherUser, myUser)

    // Sort the messages by timestamp
    // const orderedMessages = await orderByTimeStamp(messagesToStore, 'timestamp', true);

    // Build the Chat object
    // const chatToStore: Chat = {
    //   id: chat._id,
    //   lastMessage: chat.lastMessage?.content ?? "",
    //   chatName: `${otherUser.firstName} ${otherUser.lastName}`,
    //   lastMessageTime: chat.lastMessage ? Date.parse(chat.lastMessage.timestamp) : 0,
    //   unreadedMessages: chat.unreadCounts[myUser._id] ?? 0,
    //   lastMessageSender: chat.lastMessage
    //     ? `${chat.lastMessage.sender.firstName} ${chat.lastMessage.sender.lastName}`
    //     : "",
    //   chatStatus: otherUser.status || 'offline',
    //   messages: orderedMessages,
    // };

    // Store the chat in the database
    // await storeChatDb(chatToStore);
    await db.insert(chats).values(chatToStore).onConflictDoUpdate({
      target: chats.id,
      set: {
        lastMessage: sql`excluded.last_message`,
        chatName: sql`excluded.chat_name`,
        lastMessageTime: sql`excluded.last_message_time`,
        unreadedMessages: sql`excluded.unread_messages`,
        lastMessageSender: sql`excluded.last_message_sender`,
        chatStatus: sql`excluded.chat_status`,
      }
    });
    return chatToStore;
  };
  const syncChatsData = async () => {
    try {
      const chatsData = await get('/chat/getChats');
      const chatPromises = chatsData.map((chat: any) => processChat(chat, currentUserId || ''));
      await Promise.all(chatPromises);
      await AsyncStorage.setItem('has_logged_in_before', 'true')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          console.log("Offline mode", Date.now());
          const retryInterval = setInterval(async () => {
            try {
              const chatsData = await get('/chat/getChats');
              clearInterval(retryInterval);
              const chatPromises = chatsData.map((chat: any) => processChat(chat, currentUserId || ''));
              await Promise.all(chatPromises);
            } catch (err) {
              console.log("Offline mode", Date.now());
            }
          }, 60000)
        } else {
          console.log("Error connecting to server", err.message)
        }
      } else {
        console.log("Unexpected error syncing to server")
      }
    }
  }

  const setChatStatesFromDB = async () => {
    try {
      const chatData = await db.select().from(chats);
      const chatPromises = chatData.map(async (chat: any): Promise<Chat> => {
        const chatMessages = await db
          .select()
          .from(messages)
          .where(eq(messages.chatId, chat.id));
        return {
          ...chat,
          messages: chatMessages,
        };
      })
      const disorderedChats = await Promise.all(chatPromises);
      const orderedChats = await orderByTimeStamp(disorderedChats, "lastMessageTime");
      setUserChats(orderedChats);
    } catch (err) {
      console.error('Error setting chat states from DB:', err);
    }
  }
  // Memoized loadChats function that loads chats when the user logs in or on demand
  const loadChats = useCallback(async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      console.log("Syncronizing chats")
      await syncChatsData()
      await setChatStatesFromDB()
    } catch (err) {
      console.error('Error loading chats:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Run loadChats only when the currentUserId changes (i.e. on login)
  useEffect(() => {
    loadChats();
  }, [currentUserId]);

  // Set up socket connection and listen for events
  useEffect(() => {
    if (!currentUserId) return;

    const socket: Socket = io('http://192.168.20.82:3000/socket', {
      transports: ['websocket'],
      query: { userId: currentUserId },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected', currentUserId);
      socket.emit('user:join', { userId: currentUserId });
    });

    socket.on('newMessage', async (message) => {
      console.log('Received new message notification:', message);
      await syncChatsData()
      await setChatStatesFromDB()
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  const createChat = useCallback(async (participantIds: string[]) => {
    // TODO
  }, [currentUserId]);

  const sendMessage = useCallback(async (chatId: string, content: string) => {
    if (!content.trim()) return false;
    try {
      post("/chat/sendMessage", { chatId, content })
      setUserChats(prevChats => prevChats.map(chat => chat));
      loadChats();
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [loadChats]);

  const updateReadStatus = useCallback(async (userId: string, chatId: string) => {
    try {
      // TODO
      //loadChats();
    } catch (error) {
      console.error('Error updating read status:', error);
    }
  }, [loadChats]);

  return {
    chats: userChats,
    createChat,
    sendMessage,
    loading,
    updateReadStatus,
    socket: socketRef.current,
  };
}

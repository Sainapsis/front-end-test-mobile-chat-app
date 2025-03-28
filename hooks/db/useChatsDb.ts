import React, { createContext, useContext, ReactNode } from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/providers/database/db';
import { chats, messages, users } from '@/providers/database/schema';
import { eq, sql } from 'drizzle-orm';
import { useApi } from '../api/useApi';
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
  responseId?: string;
  responseTo?: string;
  readed?: number;
  mediaUri?: string;
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
    responseTo: message.response?? undefined,
    responseId: message.responseId?? undefined,
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
      ? chat.lastMessage.sender._id
      : "",
    chatStatus: otherUser.status || 'offline',
  })

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

    await db.insert(chats).values(chatToStore).onConflictDoUpdate({
      target: chats.id,
      set: {
        lastMessage: sql`excluded.last_message`,
        chatName: sql`excluded.chat_name`,
        lastMessageTime: sql`excluded.last_message_time`,
        unreadedMessages: sql`excluded.unread_messages`,
        lastMessageSender: sql`excluded.last_message_sender`,
        lastMessageSenderId: sql`excluded.last_message_sender_id`,
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
        console.log("Unexpected error syncing to server", err)
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
        const orderedMessages = await orderByTimeStamp(chatMessages, 'timestamp', true)
        return {
          ...chat,
          messages: orderedMessages,
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
  const loadChats = useCallback(async (shouldShowLoader = true) => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    try {
      shouldShowLoader && setLoading(true);
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
      await loadChats(false)
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  const createChat = useCallback(async (participantIds: string[]) => {
    // TODO
  }, [currentUserId]);

  const sendMessage = useCallback(async (chatId: string, message: any) => {
    if (!message.content.trim()) return false;
    try {
      setLoading(true);
      let response = await post("/chat/sendMessage", { chatId, ...message })
      if(response){
        setTimeout(async () =>{
          await loadChats()
        }, 1000)
      }
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [loadChats]);

  const updateReadStatus = useCallback(async (userId: string, chatId: string) => {
    try {
      console.log('here')
      await post("/chat/markAsRead", { chatId })
      await loadChats(false);
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

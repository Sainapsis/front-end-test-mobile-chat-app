import { useState, useEffect, useCallback } from 'react';
import { db } from '@/providers/database/db';
import { chats, chatParticipants, messages, users } from '@/providers/database/schema';
import { eq, and } from 'drizzle-orm';
import { User } from '@/hooks/user/useUser';
import { useApi } from '../api/useApi';
import * as SecureStore from 'expo-secure-store';

export interface Message {
  id: string,
  chatId: string,
  senderId: string,
  senderName: string,
  text?: string,
  timestamp: number,
  responseText?: string,
  mediaUri?: string,
  readed?: number,
}

export interface Chat {
  id: string,
  lastMessage: string,
  chatName: string,
  lastMessageTime: number,
  unreadedMessages: number,
  lastMessageSender: string,
  chatStatus: string
  messages?: Message[],
}

// Load the messages and determinate its read status
// const loadChatMessages = async (chatId: string, currentUserId: string): Promise<{ messages: Message[]; lastMessage?: Message; unreadedCount: number }> => {
//   const messagesData = await db
//     .select()
//     .from(messages)
//     .where(eq(messages.chatId, chatId))
//     .orderBy(messages.timestamp);

//   // For each message, we determinate if its readed or not
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
//   // Count the number of unreaded messages by user
//   // const unreadedCountRows = await db
//   //   .select()
//   //   .from(messagesReadBy)
//   //   .where(and(eq(messagesReadBy.chatId, chatId), eq(messagesReadBy.readed, false), eq(messagesReadBy.userId, currentUserId)));
//   // return { messages: messagesWithStatus, lastMessage, unreadedCount: 0 };
// }

// Load the complete information of a chat
const loadChat = async (currentUserId: string): Promise<any | null> => {

}

export function useChatsDb(currentUserId: string | null) {
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const { post, get } = useApi();

  const orderByTimeStamp = async (data: any[], timestamp: string): Promise<any[]> => {
    return data.sort((a: any, b: any) => b[timestamp] - a[timestamp]);
  }

  const refreshChats = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  // Función para transformar un mensaje de la API al formato Message
  const transformMessage = (chat: any, message: any): Message => ({
    id: message._id,
    chatId: chat._id,
    senderId: message.sender._id,
    senderName: `${message.sender.firstName} ${message.sender.lastName}`,
    text: message.content,
    timestamp: Date.parse(message.timestamp),
    responseText: message.responseText ?? undefined,
    mediaUri: message.mediaUri ?? undefined,
    // Aseguramos que 'readed' sea number (0 o 1)
    readed: message.readed !== undefined ? (message.readed ? 1 : 0) : 0,
  });

  // Función para insertar nuevos mensajes en la base de datos
  const storeNewMessages = async (chatId: string, messagesToStore: Message[]) => {
    // Obtener todos los IDs de mensajes ya existentes para el chat
    const existingMessageIds = new Set(
      (
        await db
          .select({ id: messages.id })
          .from(messages)
          .where(eq(messages.chatId, chatId))
      ).map((msg) => msg.id)
    );
    // Filtrar los mensajes que aún no están en la DB
    const newMessages = messagesToStore.filter((msg) => !existingMessageIds.has(msg.id));
    if (newMessages.length > 0) {
      await db.insert(messages).values(newMessages);
    }
  };

  // Función para insertar un chat en la base de datos (si no existe)
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

  // Función para procesar un chat recibido desde la API.
  // Recibe el chat y el currentUserId como parámetro.
  const processChat = async (chat: any, currentUserId: string): Promise<Chat> => {
    const otherUser = chat.members.find((user: any) => user._id !== currentUserId);
    const myUser = chat.members.find((user: any) => user._id === currentUserId);

    // Obtener mensajes del chat desde la API
    const messagesFromAPI = await get(`/chat/${chat._id}/messages`);
    const messagesToStore: Message[] = messagesFromAPI.map((message: any) =>
      transformMessage(chat, message)
    );

    // Insertar en la DB solo los mensajes nuevos
    await storeNewMessages(chat._id, messagesToStore);

    // Ordenar los mensajes por timestamp
    const orderedMessages = await orderByTimeStamp(messagesToStore, 'timestamp');

    // Construir el objeto Chat
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

    // Almacenar el chat en la base de datos (si es necesario)
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

        // Procesar cada chat en paralelo, pasando currentUserId como parámetro
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


  const createChat = useCallback(async (participantIds: string[]) => {
    // if (!currentUserId || !participantIds.includes(currentUserId)) {
    //   return null;
    // }

    // try {
    //   const chatId = `chat${Date.now()}`;
    //   // Insert new chat
    //   //await db.insert(chats).values({ id: chatId });
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

      // Insert the lecture status by participant
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
        prevChats.map(chat =>
          chat)
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
    updateReadStatus
  };
}
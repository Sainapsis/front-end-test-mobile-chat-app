import { useState, useEffect, useCallback } from 'react';
import { db } from '@/providers/database/db';
import { chats, chatParticipants, messages, users } from '@/providers/database/schema';
import { eq, and } from 'drizzle-orm';
import { User } from '@/hooks/user/useUser';
import { useApi } from '../api/useApi';
import * as SecureStore from 'expo-secure-store';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  readed?: boolean;
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

  const refreshChats = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const loadChats = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }
      try {
        const chatsData = await get('/chat/getChats');
        const allChats = []
        await loadChat(currentUserId)
        for (let chat of chatsData) {
          const otherUser = chat.members.filter((user: any) => user._id !== currentUserId)[0]
          const myUser = chat.members.filter((user: any) => user._id === currentUserId)[0]
          const chatToStore = {
            id: chat._id,
            lastMessage: chat.lastMessage.content,
            chatName: `${otherUser.firstName} ${otherUser.lastName}`,
            lastMessageTime: Date.parse(chat.lastMessage.timestamp),
            unreadedMessages: chat.unreadCounts[myUser._id],
            lastMessageSender: `${chat.lastMessage.sender.firstName} ${chat.lastMessage.sender.lastName}`,
            chatStatus: otherUser.status || 'offline'
          }
          allChats.push(chatToStore)
          let messages = await get(`/chat/${chat._id}/messages`)
          console.log(messages)
          let existingChat = await db.select().from(chats).where(eq(chats.id, chatToStore.id))
          if (existingChat.length === 0) {
            await db.insert(chats).values(chatToStore)
          }
        }
        setUserChats(allChats as Chat[]);
      } catch (err) {
        console.error('Error loading chats:', err);
      } finally {
        setLoading(false);
      }
      //   if (!currentUserId) {
      //     setUserChats([]);
      //     setLoading(false);
      //     return;
      //   }

      //   try {
      //     // Get IDs when user is participant
      //     const participantRows = await db
      //       .select()
      //       .from(chatParticipants)
      //       .where(eq(chatParticipants.userId, currentUserId));

      //     const chatIds = participantRows.map(row => row.chatId);
      //     if (chatIds.length === 0) {
      //       setUserChats([]);
      //       setLoading(false);
      //       return;
      //     }

      //     // Load information of each chat in parallel
      //     const loadedChats = await Promise.all(
      //       chatIds.map(async (chatId) => await loadChat(chatId, currentUserId))
      //     );

      //     const chatsFiltered = loadedChats.filter((chat): chat is Chat => chat !== null);
      //     // Order chats by created date
      //     chatsFiltered.sort((a, b) => {
      //       const timeA = a.lastMessage?.timestamp ?? 0;
      //       const timeB = b.lastMessage?.timestamp ?? 0;
      //       return timeB - timeA;
      //     });
      //     console.log(chatsFiltered)
      //     setUserChats(chatsFiltered);
      //   } catch (error) {
      //     console.error('Error loading chats:', error);
      //   } finally {
      //     setLoading(false);
      //   }
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
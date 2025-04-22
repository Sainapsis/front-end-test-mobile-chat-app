import { useChatsDb } from './db/useChatsDb';
import type { Chat, Media } from '@/interfaces/chatTypes';
export function useChats(currentUserId: string | null) {
  const { chats, createChat, sendMessage, markMessageAsRead, loading, deleteMessage  } = useChatsDb(currentUserId);

  // aux function to sort chats by last message timestamp in descending order
  const sortChatsByLastMessage = (chats: Chat[]): Chat[] => {
    return [...chats].sort((a, b) => {
      const lastMessageA = a.lastMessage?.timestamp || 0;
      const lastMessageB = b.lastMessage?.timestamp || 0;
      return lastMessageB - lastMessageA; // descending order
    });
  };
  return {
    chats: sortChatsByLastMessage(chats),
    createChat,
    sendMessage: (
      chatId: string,
      text: string,
      senderId: string,
      media?: Media | null
    ) => sendMessage(chatId, text, senderId, media),
    markMessageAsRead,
    deleteMessage,  
    loading,
  };
} 
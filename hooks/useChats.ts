import { useChatsDb } from './db/useChatsDb';
import { Message, Chat } from '@/types/types';

export { Chat, Message };

export function useChats(currentUserId: string | null) {
  const { 
    chats, 
    createChat, 
    sendMessage,
    updateMessageStatus,
    addReaction,
    deleteMessage,
    editMessage,
    loading 
  } = useChatsDb(currentUserId);

  return {
    chats,
    createChat,
    sendMessage,
    updateMessageStatus,
    addReaction,
    deleteMessage,
    editMessage,
    loading,
  };
} 
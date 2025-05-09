import { useChatsDb } from './db/useChatsDb';
import { Message } from '@/database/interface/message';
import { Chat } from '@/database/interface/chat';

export { Chat, Message };

export function useChats(currentUserId: string | null) {
  const { 
    chats, 
    createChat, 
    sendMessage, 
    editMessage, 
    deleteMessage, 
    updateMessageStatus,
    loading,
    handleLoadMore
  } = useChatsDb(currentUserId);

  return {
    chats,
    createChat,
    sendMessage,
    editMessage,
    deleteMessage,
    updateMessageStatus,
    loading,
    handleLoadMore
  };
}

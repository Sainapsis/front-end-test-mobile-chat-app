import { useChatsDb } from './db/useChatsDb';

export function useChats(currentUserId: string | null) {
  const { 
    chats, 
    createChat, 
    sendMessage, 
    editMessage, 
    deleteMessage, 
    // updateMessageStatus,
    loading,
    handleLoadMore
  } = useChatsDb(currentUserId);

  return {
    chats,
    createChat,
    sendMessage,
    editMessage,
    deleteMessage,
    // updateMessageStatus,
    loading,
    handleLoadMore
  };
}

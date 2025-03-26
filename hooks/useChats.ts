import { useChatsDb, Chat, Message } from './db/useChatsDb';

export { Chat, Message };

export function useChats(userId: string | null) {
  const { 
    chats, 
    createChat, 
    sendMessage, 
    loading, 
    clearChats,
    deleteChat,
  } = useChatsDb(userId);

  return {
    chats,
    createChat,
    sendMessage,
    loading,
    clearChats,
    deleteChat,
  };
}

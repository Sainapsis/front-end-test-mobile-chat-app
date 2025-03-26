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
    deleteMessage,
  } = useChatsDb(userId);

  return {
    chats,
    createChat,
    sendMessage,
    loading,
    clearChats,
    deleteChat,
    deleteMessage,
  };
}

import { useChatsDb, Chat, Message } from './db/useChatsDb';

export { Chat, Message };

export function useChats(currentUserId: string | null) {
  const { 
    chats, 
    createChat, 
    sendMessage, 
    deleteChat, // Importamos deleteChat desde useChatsDb
    deleteMessage, // Importamos deleteMessage desde useChatsDb
    editMessage, // Importamos editMessage desde useChatsDb
    loadMessagesForChat,
    loading 
  } = useChatsDb(currentUserId);

  return {
    chats,
    createChat,
    sendMessage,
    deleteChat, // Exponemos deleteChat
    deleteMessage,  // Exponemos deleteMessage
    editMessage, // Exponemos editMessage
    loadMessagesForChat,
    loading,
  };
}
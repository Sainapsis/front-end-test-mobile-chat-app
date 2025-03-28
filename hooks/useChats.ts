import { useChatsDb, Chat, Message, MessageReaction } from './db/useChatsDb';

export { Chat, Message, MessageReaction };

export function useChats(userId: string | null) {
  const { 
    chats, 
    createChat, 
    sendMessage, 
    loading, 
    clearChats,
    deleteChat,
    deleteMessage,
    addReaction,
    removeReaction,
    editMessage,  // Add editMessage function
  } = useChatsDb(userId);

  return {
    chats,
    createChat,
    sendMessage,
    loading,
    clearChats,
    deleteChat,
    deleteMessage,
    addReaction,
    removeReaction,
    editMessage,  // Return editMessage function
  };
}

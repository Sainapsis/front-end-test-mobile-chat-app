import { useChatsDb, Chat, Message, MessageReaction } from './db/useChatsDb';

export { Chat, Message, MessageReaction };

export function useChats(currentUserId: string | null) {
  const { 
    chats, 
    createChat, 
    sendMessage,
    markMessageAsRead,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    loading 
  } = useChatsDb(currentUserId);

  return {
    chats,
    createChat,
    sendMessage,
    markMessageAsRead,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    loading,
  };
} 
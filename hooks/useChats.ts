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
    forwardMessage,
    loadMoreMessages,
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
    forwardMessage,
    loadMoreMessages,
    loading,
  };
} 
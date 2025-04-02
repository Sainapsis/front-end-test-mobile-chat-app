import { useChatsDb, Chat, Message } from '@/hooks/db/useChatsDb';

export { Chat, Message };

export function useChats(currentUserId: string | null) {
  const { 
    chats, 
    createChat, 
    sendMessage, 
    loading,
    updateReadStatus,
    socket,
    offline,
    userMessages,
    setMessageId,
    messageIdToScroll 
  } = useChatsDb(currentUserId);

  return {
    chats,
    createChat,
    sendMessage,
    loading,
    updateReadStatus,
    socket,
    offline,
    userMessages,
    setMessageId,
    messageIdToScroll 
  };
} 
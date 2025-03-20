import { useChatsDb } from "./db/useChatsDb";

export function useChats(currentUserId: string | null) {
  const {
    chats,
    createChat,
    deleteMessage,
    sendMessage,
    loading,
    setMessageAsRead,
    editMessage,
  } = useChatsDb(currentUserId);

  return {
    chats,
    createChat,
    sendMessage,
    loading,
    setMessageAsRead,
    deleteMessage,
    editMessage,
  };
}

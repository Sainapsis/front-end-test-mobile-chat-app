import { useChatsDb } from "./db/useChatsDb";

export function useChats(currentUserId: string | null) {
  const { chats, createChat, sendMessage, loading, setMessageAsRead } =
    useChatsDb(currentUserId);

  return {
    chats,
    createChat,
    sendMessage,
    loading,
    setMessageAsRead,
  };
}

import { useChatsDb, Chat } from './db/useChatsDb';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  timestamp: number;
  delivery_status: 'sending' | 'sent' | 'delivered' | 'read';
  is_read: boolean;
}

export { Chat };

export function useChats(currentUserId: string | null) {
  const { 
    chats, 
    createChat, 
    sendMessage, 
    loading 
  } = useChatsDb(currentUserId);

  return {
    chats,
    createChat,
    sendMessage,
    loading,
  };
} 
import { useChatsDb, Chat, Message } from './db/useChatsDb';
import { useChatMessages } from './db/useChatMessages';

export { Chat, Message };

export type ChatsContextType = {
  chats: Chat[];
  createChat: (participantIds: string[]) => Promise<Chat | null>;
  sendMessage: (chatId: string, text: string, senderId: string) => Promise<boolean>;
  deleteChat: (chatId: string) => Promise<boolean>;
  loadMessagesForChat: (chatId: string) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<boolean>;
  editMessage: (chatId: string, messageId: string, newText: string) => Promise<boolean>;
  loading: boolean;
};

export function useChats(currentUserId: string | null) {
  const {
    chats, 
    createChat, 
    sendMessage, 
    deleteChat, // Importamos deleteChat desde useChatsDb
    deleteMessage, // Importamos deleteMessage desde useChatsDb
    editMessage, // Importamos editMessage desde useChatsDb
    loading 
  } = useChatsDb(currentUserId);
  const { loadMessagesForChat } = useChatMessages(currentUserId ?? '');



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
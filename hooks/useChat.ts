import { useChatDb, Message, Chat } from './db/useChatDb';

export { Chat, Message };

export function useChat(chatId: string | null) {
  const { 
    chat,
    loading,
    loadChat,
    updateMessage,
    deleteMessage,
  } = useChatDb(chatId);

  return {
    chat,
    loading,
    loadChat,
    updateMessage,
    deleteMessage,
  };
} 
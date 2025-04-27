import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useUser, User } from './useUser';
import { useChats, Chat } from './useChats';
import { useChat } from './useChat'; 
import { DatabaseProvider } from '../database/DatabaseProvider';
import { useDatabase } from './useDatabase';
import { Message  } from '@/hooks/useChats';

type AppContextType = {
  users: User[];
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (userId: string) => Promise<boolean>;
  logout: () => void;
  chats: Chat[];
  createChat: (participantIds: string[]) => Promise<Chat | null>;
  sendMessage: (chatId: string, text: string, senderId: string) => Promise<boolean>;

  loadChats: () => Promise<void>;
  loading: boolean;
  dbInitialized: boolean;
  chat: Chat | null;
  
  loadChat: (chatId: string) => Promise<void>;
  updateMessageInChat: (messageId: string, updates: Partial<Message>) => Promise<boolean>;
  deleteMessageInChat: (messageId: string) => Promise<boolean>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function AppContent({ children }: { children: ReactNode }) {
  const { isInitialized } = useDatabase();
  const userContext = useUser();
  const chatContext = useChats(userContext.currentUser?.id || null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const { chat, loading: chatLoading, loadChat, updateMessage, deleteMessage } = useChat(currentChatId);
  
  const loading = !isInitialized || userContext.loading || chatContext.loading;

  const value = {
    ...userContext,
    ...chatContext,
    chat,
    loadChat: async (chatId: string) => {
      setCurrentChatId(chatId);
      await loadChat();
    },
    updateMessageInChat: updateMessage,
    deleteMessageInChat: deleteMessage,
    loading,
    dbInitialized: isInitialized,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <DatabaseProvider>
      <AppContent>{children}</AppContent>
    </DatabaseProvider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 
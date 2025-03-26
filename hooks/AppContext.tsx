import React, { createContext, useContext, ReactNode } from 'react';
import { useUser, User } from './useUser';
import { useChats, Chat } from './useChats';
import { DatabaseProvider } from '../database/DatabaseProvider';
import { useDatabase } from './useDatabase';

type AppContextType = {
  users: User[];
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (userId: string) => Promise<boolean>;
  logout: () => void;
  chats: Chat[];
  createChat: (participantIds: string[]) => Promise<Chat | null>;
  sendMessage: (chatId: string, text: string, senderId: string) => Promise<boolean>;
  loading: boolean;
  dbInitialized: boolean;
  clearChats: (userId: string) => Promise<void>;
  deleteChat?: (chatId: string, userId: string) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function AppContent({ children }: { children: ReactNode }) {
  const { isInitialized } = useDatabase();
  const userContext = useUser();
  const chatContext = useChats(userContext.currentUser?.id || null);
  
  const loading = !isInitialized || userContext.loading || chatContext.loading;

  const value: AppContextType = {
    ...userContext,
    ...chatContext,
    loading,
    dbInitialized: isInitialized,
    deleteChat: chatContext.deleteChat || undefined,
  };

  if (!isInitialized) {
    return null; // O un componente de carga
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const AppProvider = ({ children }: { children: React.ReactNode }) => (
  <DatabaseProvider>
    <AppContent>{children}</AppContent>
  </DatabaseProvider>
);

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

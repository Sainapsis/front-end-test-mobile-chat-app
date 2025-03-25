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
  sendMessage: (
    chatId: string, 
    text: string, 
    senderId: string, 
    imageData?: { uri: string; previewUri: string }
  ) => Promise<boolean>;
  markMessageAsRead: (messageId: string, userId: string) => Promise<boolean>;
  addReaction: (messageId: string, userId: string, emoji: string) => Promise<boolean>;
  removeReaction: (messageId: string, userId: string, emoji: string) => Promise<boolean>;
  loading: boolean;
  dbInitialized: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function AppContent({ children }: { children: ReactNode }) {
  const { isInitialized } = useDatabase();
  const userContext = useUser();
  const {
    chats,
    createChat,
    sendMessage,
    markMessageAsRead,
    addReaction,
    removeReaction,
    loading: chatsLoading,
  } = useChats(userContext.currentUser?.id || null);
  
  const loading = !isInitialized || userContext.loading || chatsLoading;

  const contextValue: AppContextType = {
    users: userContext.users,
    currentUser: userContext.currentUser,
    isLoggedIn: !!userContext.currentUser,
    login: userContext.login,
    logout: userContext.logout,
    chats,
    createChat,
    sendMessage,
    markMessageAsRead,
    addReaction,
    removeReaction,
    loading,
    dbInitialized: isInitialized,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
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
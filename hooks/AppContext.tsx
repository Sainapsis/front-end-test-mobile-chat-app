import React, { createContext, useContext, ReactNode } from 'react';
import { useUser, User } from './useUser';
import { useChats, Chat } from './useChats';
import { DatabaseProvider } from '../database/DatabaseProvider';
import { useDatabase } from './useDatabase';
import { useChatsDb } from './db/useChatsDb';

export interface AppContextType {
  currentUser: User | null;
  users: User[];
  chats: Chat[];
  sendMessage: (chatId: string, text: string, senderId: string, imageUrl?: string) => Promise<boolean>;
  markMessagesAsRead: (chatId: string, userId: string) => Promise<void>;
  addReaction: (messageId: string, userId: string, reaction: string) => Promise<void>;
  removeReaction: (messageId: string, userId: string) => Promise<void>;
  loading: boolean;
  isLoggedIn: boolean;
  login: (userId: string) => Promise<boolean>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function AppContent({ children }: { children: ReactNode }) {
  const { isInitialized } = useDatabase();
  const userContext = useUser();
  const chatContext = useChats(userContext.currentUser?.id || null);
  
  const loading = !isInitialized || userContext.loading || chatContext.loading;

  const value = {
    ...userContext,
    ...chatContext,
    loading,
    dbInitialized: isInitialized,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { currentUser, users, isLoggedIn, login, logout } = useUser();
  const { chats, sendMessage, markMessagesAsRead, addReaction, removeReaction, loading } = useChatsDb(currentUser?.id || null);

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      users, 
      chats, 
      sendMessage, 
      markMessagesAsRead,
      addReaction,
      removeReaction,
      loading,
      isLoggedIn,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 
import React, { createContext, useContext, ReactNode } from 'react';
import { useUser, User } from './useUser';
import { Chat } from './useChats';
import { DatabaseProvider } from '../database/DatabaseProvider';
import { useChatsDb } from './db/useChatsDb';

export interface AppContextType {
  currentUser: User | null;
  users: User[];
  chats: Chat[];
  sendMessage: (chatId: string, text: string, senderId: string, imageUrl?: string) => Promise<boolean>;
  markMessagesAsRead: (chatId: string, userId: string) => Promise<void>;
  addReaction: (messageId: string, userId: string, reaction: string) => Promise<void>;
  removeReaction: (messageId: string, userId: string) => Promise<void>;
  createChat: (participants: string[], isGroup: boolean, groupName?: string) => Promise<Chat | null>;
  loading: boolean;
  isLoggedIn: boolean;
  login: (userId: string) => Promise<boolean>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { currentUser, users, isLoggedIn, login, logout } = useUser();
  const {
    chats,
    sendMessage,
    markMessagesAsRead,
    addReaction,
    removeReaction,
    createChat,
    loading
  } = useChatsDb(currentUser?.id || null);

  return (
    <DatabaseProvider>
      <AppContext.Provider value={{
        currentUser,
        users,
        chats,
        sendMessage,
        markMessagesAsRead,
        addReaction,
        removeReaction,
        createChat,
        loading,
        isLoggedIn,
        login,
        logout
      }}>
        {children}
      </AppContext.Provider>
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
import React, { createContext, useContext, ReactNode } from 'react';
import { useUser, User } from './useUser';
import { Chat } from './useChats';
import { DatabaseProvider } from '../database/DatabaseProvider';
import { useChatsDb } from './db/useChatsDb';

export interface AppContextType {
  currentUser: User | null;
  users: User[];
  chats: Chat[];
  sendMessage: (chatId: string, text: string, senderId: string, imageUrl?: string, voiceUrl?: string, isForwarded?: boolean) => Promise<boolean>;
  markMessagesAsRead: (chatId: string, userId: string) => Promise<void>;
  addReaction: (messageId: string, userId: string, reaction: string) => Promise<void>;
  removeReaction: (messageId: string, userId: string) => Promise<void>;
  createChat: (participants: string[], isGroup: boolean, groupName?: string) => Promise<Chat | null>;
  editMessage: (messageId: string, newText: string) => Promise<void>;
  deleteMessage: (messageId: string, userId: string, deleteForEveryone: boolean) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  deleteAllMessages: (chatId: string) => Promise<void>;
  loadMoreMessages: (chatId: string) => Promise<void>;
  hasMoreMessages: Record<string, boolean>;
  loadingMore: boolean;
  loading: boolean;
  isLoggedIn: boolean;
  login: (userId: string) => Promise<boolean>;
  logout: () => void;
  loadUsers: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { currentUser, users, isLoggedIn, login, logout, loadUsers } = useUser();
  const {
    chats,
    sendMessage,
    markMessagesAsRead,
    addReaction,
    removeReaction,
    createChat,
    editMessage,
    deleteMessage,
    deleteChat,
    deleteAllMessages,
    loadMoreMessages,
    hasMoreMessages,
    loadingMore,
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
        editMessage,
        deleteMessage,
        deleteChat,
        deleteAllMessages,
        loadMoreMessages,
        hasMoreMessages,
        loadingMore,
        loading,
        isLoggedIn,
        login,
        logout,
        loadUsers
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
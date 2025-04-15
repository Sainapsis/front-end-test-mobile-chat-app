import React, { createContext, useContext, ReactNode } from 'react';
import { useUser, User } from './useUser';
import { useChats, Chat } from './useChats';
import { DatabaseProvider } from '../database/DatabaseProvider';
import { useDatabase } from './useDatabase';
import { MediaAttachment } from '@/types/types';

type AppContextType = {
  users: User[];
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (userId: string) => Promise<boolean>;
  logout: () => void;
  chats: Chat[];
  createChat: (participantIds: string[]) => Promise<Chat | null>;
  sendMessage: (chatId: string, text: string, senderId: string, media?: MediaAttachment[]) => Promise<boolean>;
  loading: boolean;
  dbInitialized: boolean;
  updateMessageStatus: (chatId: string, messageId: string, status: 'delivered' | 'read', userId?: string) => Promise<boolean>;
  addReaction: (chatId: string, messageId: string, emoji: string) => Promise<boolean>;
  deleteMessage: (chatId: string, messageId: string) => Promise<boolean>;
  editMessage: (chatId: string, messageId: string, newText: string) => Promise<boolean>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function AppContent({ children }: { children: ReactNode }) {
  const { isInitialized } = useDatabase();
  const userContext = useUser();
  const chatContext = useChats(userContext.currentUser?.id || null);
  
  const loading = !isInitialized || userContext.loading || chatContext.loading;

  const value = {
    ...userContext,
    ...chatContext,
    sendMessage: (chatId: string, text: string, senderId: string, media: MediaAttachment[] = []) => chatContext.sendMessage(chatId, text, senderId, media),
    updateMessageStatus: chatContext.updateMessageStatus,
    addReaction: chatContext.addReaction,
    loading,
    dbInitialized: isInitialized,
    deleteMessage: chatContext.deleteMessage,
    editMessage: chatContext.editMessage,
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
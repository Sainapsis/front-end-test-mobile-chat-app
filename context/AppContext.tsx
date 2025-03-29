import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from '@/hooks/useUser';
import { useChats } from '@/hooks/useChats';
import { DatabaseProvider } from '../database/DatabaseProvider';
import { useDatabase } from '@/hooks/useDatabase';
import { User } from '@/types/User';
import { Chat } from '@/types/Chat';

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
  deleteMessage?: (messageId: string, chatId: string) => Promise<boolean>;
  addReaction?: (messageId: string, emoji: string) => Promise<boolean>;
  removeReaction?: (reactionId: string, messageId: string) => Promise<boolean>;
  editMessage?: (messageId: string, newText: string) => Promise<boolean>;
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
    deleteMessage: chatContext.deleteMessage || undefined,
    addReaction: chatContext.addReaction || undefined,
    removeReaction: chatContext.removeReaction || undefined,
    editMessage: chatContext.editMessage || undefined,
  };

  if (!isInitialized) {
    return null;
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
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

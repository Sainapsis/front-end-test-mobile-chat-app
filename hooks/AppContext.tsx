import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from './useUser';
import { useChats } from './useChats';
import { DatabaseProvider } from '../database/DatabaseProvider';
import { useDatabase } from './useDatabase';
import { User } from '@/src/domain/entities/user';
import { Chat } from '@/src/domain/entities/chat';
import { Message } from '@/src/domain/entities/message';

interface AppContextType {
  users: User[];
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (userId: string) => Promise<boolean>;
  logout: () => void;
  chats: Chat[];
  createChat: (participantIds: string[]) => Promise<Chat | null>;
  sendMessage: (chatId: string, message: Message) => Promise<boolean>;
  editMessage: (chatId: string, messageId: string, newText: string) => Promise<boolean>;
  deleteMessage: (chatId: string, messageId: string) => Promise<boolean>;
  // updateMessageStatus: (chatId: string, messageId: string, status: MessageStatus) => Promise<void>;
  loading: boolean;
  dbInitialized: boolean;
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
    editMessage: chatContext.editMessage,
    deleteMessage: chatContext.deleteMessage,
    // updateMessageStatus: chatContext.updateMessageStatus,
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
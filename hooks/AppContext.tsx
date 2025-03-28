import React, { createContext, useContext, ReactNode } from 'react';
import { useUser, User } from '@/hooks/user/useUser';
import { useChats, Chat } from '@/hooks/chats/useChats';
import { DatabaseProvider } from '@/providers/database/DatabaseProvider';
import { useDatabase } from '@/hooks//db/useDatabase';
import { Socket } from 'socket.io-client';

type AppContextType = {
  users: User[];
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (username:string, password: string) => Promise<boolean>;
  logout: () => void;
  chats: Chat[];
  createChat: (participantIds: string[]) => Promise<void>;
  sendMessage: (chatId: string, text: string, senderId: string) => Promise<boolean>;
  updateReadStatus: (chatId: string, userId: string) => Promise<void>;
  loading: boolean;
  dbInitialized: boolean;
  socket: Socket | null;
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
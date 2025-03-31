import React, { createContext, useContext, ReactNode } from 'react';
import { DatabaseProvider, useDatabaseStatus } from './DataBaseContext';
import { useChatsDb,  useUserDb } from '../hooks/db';
import { Chat, Message, User } from '@/utils/types';

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
    text: string | undefined, 
    senderId: string,
    mediaUrl?: string,
    mediaType?: string,
    mediaThumbnail?: string,
    voiceUrl?: string,
    voiceDuration?: number,
    isVoiceMessage?: boolean,
    
  ) => Promise<Message | null>;
  addReaction: (messageId: string, userId: string, emoji: string) => Promise<boolean>;
  removeReaction: (reactionId: string) => Promise<boolean>;
  searchMessages: (query: string, chatId?: string) => Promise<void>;
  searchResults: Message[];
  deleteMessage: (messageId: string) => Promise<boolean>;
  editMessage: (messageId: string, newText: string) => Promise<boolean>;
  updateMessageStatus: (messageId: string, status: 'sent' | 'delivered' | 'read') => Promise<void>;
  markMessagesAsRead: (chatId: string) => Promise<void>;
  loading: boolean;
  dbInitialized: boolean;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

function AppContent({ children }: { children: ReactNode }) {
  const { isInitialized } = useDatabaseStatus();
  const userContext = useUserDb();
  const chatContext = useChatsDb(userContext.currentUser?.id || null);
  
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


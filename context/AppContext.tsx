import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from '@/hooks/useUser';
import { useChats } from '@/hooks/useChats';
import { DatabaseProvider } from '../database/DatabaseProvider';
import { useDatabase } from '@/hooks/useDatabase';
import { User } from '@/types/User';
import { Chat } from '@/types/Chat';

/**
 * Interface representing the application context state
 */
type AppContextType = {
  users: User[];
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (userId: string) => Promise<boolean>;
  logout: () => void;
  /** List of chats for the current user */
  chats: Chat[];
  createChat: (participantIds: string[]) => Promise<Chat | null>;
  sendMessage: (chatId: string, text: string, senderId: string, imageUri?: string) => Promise<boolean>;
  loading: boolean;
  dbInitialized: boolean;
  clearChats: (userId: string) => Promise<void>;
  deleteChat?: (chatId: string, userId: string) => Promise<void>;
  deleteMessage?: (messageId: string, chatId: string) => Promise<boolean>;
  addReaction?: (messageId: string, emoji: string) => Promise<boolean>;
  removeReaction?: (reactionId: string, messageId: string) => Promise<boolean>;
  editMessage?: (messageId: string, newText: string) => Promise<boolean>;
};

/**
 * Context for managing application-wide state
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Internal component that wraps the application content with context
 * @param children - Child components to be wrapped by the context
 */
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
    sendMessage: async (chatId: string, text: string, senderId: string, imageUri?: string) => {
      if (!chatContext.sendMessage) return false;
      return chatContext.sendMessage(chatId, text, senderId, imageUri);
    },
  };

  if (!isInitialized) {
    return null;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Provider component that wraps the application with necessary contexts
 * @param children - Child components to be wrapped by the provider
 */
export const AppProvider = ({ children }: { children: React.ReactNode }) => (
  <DatabaseProvider>
    <AppContent>{children}</AppContent>
  </DatabaseProvider>
);

/**
 * Hook for accessing application context
 * @returns Application context containing user, chat, and database states
 * @throws Error if used outside of AppProvider
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

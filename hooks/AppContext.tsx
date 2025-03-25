import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useUser, User } from './useUser';
import { useChats, Chat } from './useChats';
import { DatabaseProvider } from '../database/DatabaseProvider';
import { useDatabase } from './useDatabase';
import { log, monitoring, startMeasure, endMeasure } from '@/utils';

export interface AppContextType {
  users: User[];
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (userId: string) => Promise<boolean>;
  logout: () => void;
  chats: Chat[];
  createChat: (participantIds: string[], groupName?: string) => Promise<Chat | null>;
  sendMessage: (
    chatId: string,
    text: string,
    senderId: string,
    imageData?: { uri: string; previewUri: string },
    voiceData?: { uri: string; duration: number }
  ) => Promise<boolean>;
  forwardMessage: (
    sourceMessageId: string,
    targetChatId: string
  ) => Promise<boolean>;
  markMessageAsRead: (messageId: string, userId: string) => Promise<boolean>;
  addReaction: (messageId: string, userId: string, emoji: string) => Promise<boolean>;
  removeReaction: (messageId: string, userId: string, emoji: string) => Promise<boolean>;
  editMessage: (messageId: string, newText: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  loadMoreMessages: (chatId: string) => Promise<boolean>;
  loading: boolean;
  dbInitialized: boolean;
  clearImageCache?: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { users, currentUser, login, logout, isLoggedIn, loading: userLoading } = useUser();

  // Adaptar el objeto currentUser para que sea compatible con User de useChats
  const adaptedCurrentUser = currentUser ? {
    ...currentUser,
    isOnline: currentUser.status === 'online',
    lastSeen: Date.now(),
  } : null;

  const { chats, createChat, sendMessage, forwardMessage, markMessageAsRead, addReaction, removeReaction, editMessage, deleteMessage, loadMoreMessages, loading: chatsLoading, clearImageCache } = useChats(adaptedCurrentUser);
  const { isInitialized: dbInitialized, error: dbError } = useDatabase();

  // Registrar el estado de la aplicación en cada cambio importante
  useEffect(() => {
    log.info(`App state: loggedIn=${isLoggedIn}, dbInitialized=${dbInitialized}, user=${currentUser?.id || 'none'}`);

    if (dbError) {
      monitoring.captureError(dbError, { context: 'database_initialization' });
    }
  }, [isLoggedIn, dbInitialized, currentUser, dbError]);

  // Monitorear los tiempos de carga
  useEffect(() => {
    const loadingMetricId = startMeasure('app_loading');

    if (!userLoading && !chatsLoading) {
      const metric = endMeasure(loadingMetricId);
      log.debug(`App loading completed in ${metric?.duration?.toFixed(2) || '?'}ms`);
    }
  }, [userLoading, chatsLoading]);

  // Monitorear cambios en chats
  useEffect(() => {
    log.info(`Chats loaded: count=${chats.length}`);
  }, [chats.length]);

  // Funciones mejoradas con logging y monitoreo
  const enhancedSendMessage = async (
    chatId: string,
    text: string,
    senderId: string,
    imageData?: { uri: string; previewUri: string },
    voiceData?: { uri: string; duration: number }
  ) => {
    const metricId = startMeasure('send_message');
    try {
      log.info(`Sending message: chat=${chatId}, type=${imageData ? 'image' : voiceData ? 'voice' : 'text'}`);
      const result = await sendMessage(chatId, text, senderId, imageData, voiceData);
      log.debug(`Message sent result: ${result}`);
      return result;
    } catch (error) {
      const errorId = monitoring.captureError(
        error instanceof Error ? error : new Error(String(error)),
        { action: 'sendMessage', chatId, senderId }
      );
      log.error(`Failed to send message [errorId: ${errorId}]`);
      return false;
    } finally {
      endMeasure(metricId);
    }
  };

  const enhancedCreateChat = async (participantIds: string[], groupName?: string) => {
    const metricId = startMeasure('create_chat');
    try {
      log.info(`Creating chat: participants=${participantIds.length}, isGroup=${!!groupName}`);
      const result = await createChat(participantIds, groupName);
      log.debug(`Chat created: ${result?.id || 'failed'}`);
      return result;
    } catch (error) {
      const errorId = monitoring.captureError(
        error instanceof Error ? error : new Error(String(error)),
        { action: 'createChat', participantCount: participantIds.length }
      );
      log.error(`Failed to create chat [errorId: ${errorId}]`);
      return null;
    } finally {
      endMeasure(metricId);
    }
  };

  return (
    <DatabaseProvider>
      <AppContext.Provider
        value={{
          users,
          currentUser,
          login,
          logout,
          isLoggedIn,
          chats,
          // Use enhanced functions with monitoring
          createChat: enhancedCreateChat,
          sendMessage: enhancedSendMessage,
          forwardMessage,
          markMessageAsRead,
          addReaction,
          removeReaction,
          editMessage,
          deleteMessage,
          loadMoreMessages,
          loading: userLoading || chatsLoading,
          dbInitialized,
          clearImageCache
        }}
      >
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
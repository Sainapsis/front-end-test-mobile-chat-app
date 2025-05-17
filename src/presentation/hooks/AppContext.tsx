import React, { createContext, useContext, ReactNode } from "react";
import { useDatabase } from "./useDatabase";
import { useChat } from "@/src/presentation/hooks/useChat";
import { useUser } from "@/src/presentation/hooks/useUser";
import { User } from "@/src/domain/entities/user";
import { Chat } from "@/src/domain/entities/chat";
import { Message, MessageStatus } from "@/src/domain/entities/message";
import { LoginParams } from "@/src/data/interfaces/user.interface";
import {
  CreateChatParams,
  DeleteMessageParams,
  EditMessageParams,
  UpdateStatusMessageParams,
} from "@/src/data/interfaces/chat.interface";
import { DatabaseProvider } from '@/src/presentation/context/DatabaseProvider';

interface AppContextType {
  dbInitialized: boolean;
  loading: boolean;
  users: User[];
  currentUser: User | null;
  isLoggedIn: boolean;
  userChats: Chat[];
  login: ({ userId }: LoginParams) => Promise<boolean>;
  logout: () => void;
  updateStatus: (
    currentUserId: string,
    chat: Chat,
    statusMessage: MessageStatus
  ) => Promise<void>;
  createChat: ({
    chatId,
    participantIds,
  }: CreateChatParams) => Promise<Chat | null>;
  sendMessage: (chatId: string, message: Message) => Promise<boolean>;
  editMessage: ({
    chatId,
    messageId,
    newText,
  }: EditMessageParams) => Promise<boolean>;
  deleteMessage: ({
    chatId,
    messageId,
  }: DeleteMessageParams) => Promise<boolean>;
  updateMessageStatus: (
    chatId: string,
    { messageId, status }: UpdateStatusMessageParams
  ) => Promise<void>;
  handleLoadMoreMessage: ({ chatId }: { chatId: string }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function AppContent({ children }: { children: ReactNode }) {
  const { isInitialized } = useDatabase();
  const userContext = useUser();
  const chatContext = useChat({
    currentUserId: userContext.currentUser?.id || null,
  });

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
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

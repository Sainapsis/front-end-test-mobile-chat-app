// TP
import React, { createContext, useContext, ReactNode } from "react";

// BL
import { useUser } from "./useUser";
import { useChats } from "./useChats";
import { DatabaseProvider } from "../database/DatabaseProvider";
import { useDatabase } from "./useDatabase";
import {
  SendMessageInterface,
  ChatInterface,
  EditMessageProps,
  DeleteMessageProps,
  ForwardMessageProps,
  AddReactionToMessageProps,
} from "@/lib/interfaces/Messages.interface";
import { UserInterface } from "@/lib/interfaces/User.interface";

type AppContextType = {
  users: UserInterface[];
  currentUser: UserInterface | null;
  isLoggedIn: boolean;
  login: (userId: string) => Promise<boolean>;
  logout: () => void;
  chats: ChatInterface[];
  createChat: (participantIds: string[]) => Promise<ChatInterface | null>;
  sendMessage: (message: SendMessageInterface) => Promise<boolean>;
  loading: boolean;
  deleteMessage: (props: DeleteMessageProps) => Promise<void>;
  forwardMessage: (props: ForwardMessageProps) => Promise<void>;
  dbInitialized: boolean;
  addReactionToMessage: (props: AddReactionToMessageProps) => Promise<void>;
  editMessage: (props: EditMessageProps) => Promise<void>;
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
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

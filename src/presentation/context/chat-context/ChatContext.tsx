import { createContext, useContext } from "react";
import { ChatContextType } from './ChatContext.types';

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within an ChatProvider");
  }
  return context;
}

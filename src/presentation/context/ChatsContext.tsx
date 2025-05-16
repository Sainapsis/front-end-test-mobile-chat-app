import { Chat } from "@/src/domain/entities/chat";
import { createContext, ReactNode, useContext } from "react";
import { useChats } from "../hooks/useChats";
import { CreateChatParams } from "@/src/data/interfaces/chats.interface";
import { useAuthContext } from "./AuthContext";
import { useChatRoom } from '../hooks/useChatRoom';
import { ChatRoomContext } from './ChatRoomContext';

interface ChatsContextType {
  chats: Chat[];
  createChat: ({
    chatId,
    participantIds,
  }: CreateChatParams) => Promise<Chat | null>;
}

const _ChatsContext = createContext<ChatsContextType | undefined>(undefined);

export function ChatsContent({ chatId, children }: { chatId: string; children: ReactNode }) {
  const { currentUser } = useAuthContext();
  const chatContext = useChatRoom({ chatId });
  const chatsContext = useChats({
    currentUserId: currentUser?.id || null,
  });

  const value = {
    ...chatsContext,
    ...chatContext,
  };

  return (
    <_ChatsContext.Provider value={value}>{children}</_ChatsContext.Provider>
  );
}

export function ChatsProvider({ chatId, children }: { chatId: string; children: ReactNode }) {
  return (
    <ChatsContent chatId={chatId}>
      <ChatRoomContext chatId={chatId}>
        {children}
      </ChatRoomContext>
    </ChatsContent>
  );
}

export function useChatsContext() {
  const context = useContext(_ChatsContext);

  if (context === undefined) {
    throw new Error("useChatsContext must be used within an AppProvider");
  }

  return context;
}

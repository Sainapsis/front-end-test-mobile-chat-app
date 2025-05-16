import { DeleteMessageParams, EditMessageParams, UpdateStatusMessageParams } from '@/src/data/interfaces/chatRoom.interface';
import { Chat } from '@/src/domain/entities/chat';
import { Message, MessageStatus } from '@/src/domain/entities/message';
import { createContext, ReactNode, useContext } from "react";
import { useChatRoom } from '../hooks/useChatRoom';

interface ChatRoomContextType {
  updateStatus: (
    currentUserId: string,
    chat: Chat,
    statusMessage: MessageStatus
  ) => Promise<void>;
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

const _ChatRoomContext = createContext<ChatRoomContextType | undefined>(undefined);

export function ChatRoomContext({ chatId, children }: { chatId: string; children: ReactNode }) {
  const chatRoomContext = useChatRoom({ chatId });

  const value = {
    ...chatRoomContext,
  };

  return (
    <_ChatRoomContext.Provider value={value}>{children}</_ChatRoomContext.Provider>
  );
}

export function useChatRoomContext() {
  const context = useContext(_ChatRoomContext);

  if (context === undefined) {
    throw new Error("useChatRoomContext must be used within an AppProvider");
  }

  return context;
}

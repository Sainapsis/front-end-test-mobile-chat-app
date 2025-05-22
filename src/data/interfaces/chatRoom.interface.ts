import { Chat } from "@/src/domain/entities/chat";
import { Message, MessageStatus } from "@/src/domain/entities/message";

export interface SendMessageParams {
  chatId: string;
  message: Message;
}

export interface UpdateStatusMessageParams {
  currentUserId: string;
  statusToUpdate: MessageStatus;
  currentStatus: MessageStatus;
}

export interface DeleteMessageParams {
  chatId: string;
  messageId: string;
}

export interface EditMessageParams {
  chatId: string;
  messageId: string;
  newText: string;
}

export interface ChatRoomRepository {
  sendMessage: ({ chatId, message }: SendMessageParams) => Promise<void>;
  updateStatusMessage: ({
    currentUserId,
    statusToUpdate,
    currentStatus,
  }: UpdateStatusMessageParams) => Promise<boolean>;
  deleteMessage: ({ chatId, messageId }: DeleteMessageParams) => Promise<void>;
  editMessage: ({
    chatId,
    messageId,
    newText,
  }: EditMessageParams) => Promise<void>;
  getChatByID: ({ chatId }: { chatId: string }) => Promise<Chat>;
}

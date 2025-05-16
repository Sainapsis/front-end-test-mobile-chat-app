import { Message, MessageStatus } from "@/src/domain/entities/message";

export interface SendMessageParams {
  chatId: string;
  message: Message;
}

export interface UpdateStatusMessageParams {
  messageId: string;
  status: MessageStatus;
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
    messageId,
    status,
  }: UpdateStatusMessageParams) => Promise<void>;
  deleteMessage: ({ chatId, messageId }: DeleteMessageParams) => Promise<void>;
  editMessage: ({
    chatId,
    messageId,
    newText,
  }: EditMessageParams) => Promise<void>;
}

import { Message, MessageStatus } from "@/src/domain/entities/message";

export interface CreateChatParams {
  chatId: string;
  participantIds: string[];
}

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

export interface ChatRepository {
  createChat: ({ chatId, participantIds }: CreateChatParams) => Promise<void>;
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

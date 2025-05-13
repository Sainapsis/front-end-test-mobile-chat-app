import {
  ChatRepository,
  CreateChatParams,
  DeleteMessageParams,
  EditMessageParams,
  SendMessageParams,
  UpdateStatusMessageParams,
} from "@/src/data/interfaces/chat.interface";

export const createChat =
  (repository: ChatRepository) =>
  async ({ chatId, participantIds }: CreateChatParams) => {
    await repository.createChat({ chatId, participantIds });
  };

export const sendMessage =
  (repository: ChatRepository) =>
  async ({ chatId, message }: SendMessageParams) => {
    await repository.sendMessage({ chatId, message });
  };

export const updateStatusMessage =
  (repository: ChatRepository) =>
  async ({ messageId, status }: UpdateStatusMessageParams) => {
    await repository.updateStatusMessage({ messageId, status });
  };

export const deleteMessage =
  (repository: ChatRepository) =>
  async ({ chatId, messageId }: DeleteMessageParams) => {
    await repository.deleteMessage({ chatId, messageId });
  };

export const editMessage =
  (repository: ChatRepository) =>
  async ({ chatId, messageId, newText }: EditMessageParams) => {
    await repository.editMessage({ chatId, messageId, newText });
  };

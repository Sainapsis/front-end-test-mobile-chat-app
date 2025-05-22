import {
  ChatRoomRepository,
  DeleteMessageParams,
  EditMessageParams,
  SendMessageParams,
  UpdateStatusMessageParams,
} from "@/src/data/interfaces/chatRoom.interface";

export const sendMessage =
  (repository: ChatRoomRepository) =>
  async ({ chatId, message }: SendMessageParams) => {
    await repository.sendMessage({ chatId, message });
  };

export const updateStatusMessage =
  (repository: ChatRoomRepository) =>
  async ({ currentUserId, statusToUpdate, currentStatus }: UpdateStatusMessageParams) => {
    return await repository.updateStatusMessage({ currentUserId, statusToUpdate, currentStatus });
  };

export const deleteMessage =
  (repository: ChatRoomRepository) =>
  async ({ chatId, messageId }: DeleteMessageParams) => {
    await repository.deleteMessage({ chatId, messageId });
  };

export const editMessage =
  (repository: ChatRoomRepository) =>
  async ({ chatId, messageId, newText }: EditMessageParams) => {
    await repository.editMessage({ chatId, messageId, newText });
  };

export const getChatByID =
  (repository: ChatRoomRepository) =>
  async ({ chatId }: { chatId: string }) => {
    return await repository.getChatByID({ chatId });
  };

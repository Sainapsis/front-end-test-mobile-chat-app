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
  async ({ messageId, status }: UpdateStatusMessageParams) => {
    await repository.updateStatusMessage({ messageId, status });
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

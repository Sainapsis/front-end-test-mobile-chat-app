import {
  ChatDataParams,
  ChatRepository,
  CreateChatParams,
  DeleteMessageParams,
  EditMessageParams,
  MessageDataParams,
  ParticipantDataParams,
  ParticipantRowsParams,
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

export const participantRows =
  (repository: ChatRepository) =>
  async ({ currentUserId }: ParticipantRowsParams) => {
    return await repository.participantRows({ currentUserId });
  };

export const chatData =
  (repository: ChatRepository) =>
  async ({ chatId }: ChatDataParams) => {
    return await repository.chatData({ chatId });
  };

export const participantData =
  (repository: ChatRepository) =>
  async ({ chatId }: ParticipantDataParams) => {
    return await repository.participantData({ chatId });
  };

export const messagesData =
  (repository: ChatRepository) =>
  async ({ chatId }: MessageDataParams) => {
    return await repository.messagesData({ chatId });
  };

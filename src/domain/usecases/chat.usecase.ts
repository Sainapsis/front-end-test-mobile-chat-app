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
    const participantRows = await repository.participantRows({ currentUserId });

    return participantRows;
  };

export const chatData =
  (repository: ChatRepository) =>
  async ({ chatId }: ChatDataParams) => {
    const participantRows = await repository.chatData({ chatId });

    return participantRows;
  };

export const participantData =
  (repository: ChatRepository) =>
  async ({ chatId }: ParticipantDataParams) => {
    const participantData = await repository.participantData({ chatId });

    return participantData;
    };
  
export const messagesData =
  (repository: ChatRepository) =>
  async ({ chatId }: MessageDataParams) => {
    const messageData = await repository.messagesData({ chatId });

    return messageData;
  };

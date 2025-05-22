import {
  ChatDataParams,
  ChatRepository,
  CreateChatParams,
  MessageDataParams,
  ParticipantDataParams,
  ParticipantRowsParams,
} from "@/src/data/interfaces/chat.interface";

export const createChat =
  (repository: ChatRepository) =>
  async ({ chatId, participants }: CreateChatParams) => {
    return await repository.createChat({ chatId, participants });
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
  async ({ chatId, page }: MessageDataParams) => {
    return await repository.messagesData({ chatId, page });
  };

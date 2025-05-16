import { ChatsDataParams, ChatsRepository, CreateChatParams, MessageDataParams, ParticipantDataParams, ParticipantRowsParams } from '@/src/data/interfaces/chats.interface';

export const createChat =
  (repository: ChatsRepository) =>
  async ({ chatId, participantIds }: CreateChatParams) => {
    await repository.createChat({ chatId, participantIds });
  };

export const participantRows =
  (repository: ChatsRepository) =>
  async ({ currentUserId }: ParticipantRowsParams) => {
    return await repository.participantRows({ currentUserId });
  };

export const chatData =
  (repository: ChatsRepository) =>
  async ({ chatId }: ChatsDataParams) => {
    return await repository.chatData({ chatId });
  };

export const participantData =
  (repository: ChatsRepository) =>
  async ({ chatId }: ParticipantDataParams) => {
    return await repository.participantData({ chatId });
  };
 
export const messagesData =
  (repository: ChatsRepository) =>
  async ({ chatId }: MessageDataParams) => {
    return await repository.messagesData({ chatId });
  };

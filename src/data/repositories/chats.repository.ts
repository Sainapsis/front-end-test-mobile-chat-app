import {
  chatsDataDB,
  createChatDB,
  messagesDataDB,
  participantDataDB,
  participantRowsDB,
} from "@/src/infrastructure/database/chats.database";
import {
  ChatsDataParams,
  ChatsRepository,
  CreateChatParams,
  MessageDataParams,
  ParticipantDataParams,
  ParticipantRowsParams,
} from "../interfaces/chats.interface";

export const chatsRepository: ChatsRepository = {
  createChat: async ({ chatId, participantIds }: CreateChatParams) => {
    await createChatDB({ chatId, participantIds });
  },
  participantRows: async ({ currentUserId }: ParticipantRowsParams) => {
    return await participantRowsDB({ currentUserId });
  },
  chatData: async ({ chatId }: ChatsDataParams) => {
    return await chatsDataDB({ chatId });
  },
  participantData: async ({ chatId }: ParticipantDataParams) => {
    return await participantDataDB({ chatId });
  },
  messagesData: async ({ chatId }: MessageDataParams) => {
    return await messagesDataDB({ chatId });
  },
};

import {
  chatDataDB,
  createChatDB,
  messagesDataDB,
  participantDataDB,
  participantRowsDB,
} from "@/src/infrastructure/database/chat.database";
import {
  ChatDataParams,
  ChatRepository,
  CreateChatParams,
  MessageDataParams,
  ParticipantDataParams,
  ParticipantRowsParams,
} from "../interfaces/chat.interface";

export const chatRepository: ChatRepository = {
  createChat: async ({ chatId, participants }: CreateChatParams) => {
    return await createChatDB({ chatId, participants });
  },
  participantRows: async ({ currentUserId }: ParticipantRowsParams) => {
    return await participantRowsDB({ currentUserId });
  },
  chatData: async ({ chatId }: ChatDataParams) => {
    return await chatDataDB({ chatId });
  },
  participantData: async ({ chatId }: ParticipantDataParams) => {
    return await participantDataDB({ chatId });
  },
  messagesData: async ({ chatId, page }: MessageDataParams) => {
    return await messagesDataDB({ chatId, page });
  },
};

import {
  chatDataDB,
  createChatDB,
  deleteMessageDB,
  editMessageDB,
  messagesDataDB,
  participantDataDB,
  participantRowsDB,
  sendMessageDB,
  updateStatusMessageDB,
} from "@/src/infrastructure/database/chat.database";
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
} from "../interfaces/chat.interface";

export const chatRepository: ChatRepository = {
  createChat: async ({ chatId, participantIds }: CreateChatParams) => {
    await createChatDB({ chatId, participantIds });
  },
  sendMessage: async ({ chatId, message }: SendMessageParams) => {
    await sendMessageDB({ chatId, message });
  },
  updateStatusMessage: async ({
    messageId,
    status,
  }: UpdateStatusMessageParams) => {
    await updateStatusMessageDB({ messageId, status });
  },
  deleteMessage: async ({ messageId }: DeleteMessageParams) => {
    await deleteMessageDB({ messageId });
  },
  editMessage: async ({ messageId, newText }: EditMessageParams) => {
    await editMessageDB({ messageId, newText });
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
  messagesData: async ({ chatId }: MessageDataParams) => {
    return await messagesDataDB({ chatId });
  },
};

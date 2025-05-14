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
    const participantRows = await participantRowsDB({ currentUserId });

    return participantRows;
  },
  chatData: async ({ chatId }: ChatDataParams) => {
    const chatData = await chatDataDB({ chatId });

    return chatData;
  },
  participantData: async ({ chatId }: ParticipantDataParams) => {
    const participantData = await participantDataDB({ chatId });

    return participantData;
  },
  messagesData: async ({ chatId }: MessageDataParams) => {
    const messageData = await messagesDataDB({ chatId });

    return messageData;
  },
};

import {
  createChatDB,
  deleteMessageDB,
  editMessageDB,
  sendMessageDB,
  updateStatusMessageDB,
} from "@/src/infrastructure/database/chat.database";
import {
  ChatRepository,
  CreateChatParams,
  DeleteMessageParams,
  EditMessageParams,
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
};

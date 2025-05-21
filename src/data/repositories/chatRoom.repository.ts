import {
  deleteMessageDB,
  editMessageDB,
  getChatByIDDB,
  sendMessageDB,
  updateStatusMessageDB,
} from "@/src/infrastructure/database/chatRoom.database";
import {
  ChatRoomRepository,
  DeleteMessageParams,
  EditMessageParams,
  SendMessageParams,
  UpdateStatusMessageParams,
} from "../interfaces/chatRoom.interface";

export const chatRoomRepository: ChatRoomRepository = {
  sendMessage: async ({ chatId, message }: SendMessageParams) => {
    await sendMessageDB({ chatId, message });
  },
  updateStatusMessage: async ({
    currentUserId,
    statusToUpdate,
    currentStatus,
  }: UpdateStatusMessageParams) => {
    return await updateStatusMessageDB({ currentUserId, statusToUpdate, currentStatus });
  },
  deleteMessage: async ({ messageId }: DeleteMessageParams) => {
    await deleteMessageDB({ messageId });
  },
  editMessage: async ({ messageId, newText }: EditMessageParams) => {
    await editMessageDB({ messageId, newText });
  },
  getChatByID: async ({ chatId }: { chatId: string }) => {
    return await getChatByIDDB({ chatId });
  },
};

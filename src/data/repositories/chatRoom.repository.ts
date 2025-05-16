import {
  deleteMessageDB,
  editMessageDB,
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

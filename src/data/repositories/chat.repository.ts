import { updateStatusMessageDB } from '@/src/infrastructure/database/chat.database';
import {
  ChatRepository,
  UpdateStatusMessageParams,
} from "../interfaces/chat.interface";

export const chatRepository: ChatRepository = {
  updateStatusMessage: async ({
    messageId,
    status,
  }: UpdateStatusMessageParams) => {
    await updateStatusMessageDB(messageId, status);
  },
};

import { ChatRepository, UpdateStatusMessageParams } from "@/src/data/interfaces/chat.interface";

export const updateStatusMessage = (repository: ChatRepository) => async ({ messageId, status }: UpdateStatusMessageParams) => {
  await repository.updateStatusMessage({ messageId, status });
};

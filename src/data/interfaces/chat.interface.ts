import { MessageStatus } from '@/src/domain/entities/message';

export interface UpdateStatusMessageParams {
  messageId: string;
  status: MessageStatus;
}

export interface ChatRepository {
  updateStatusMessage: ({
    messageId,
    status,
  }: UpdateStatusMessageParams) => Promise<void>;
}

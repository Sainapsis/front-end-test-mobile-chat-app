import { Message } from "@/src/domain/entities/message";
import { User } from "@/src/domain/entities/user";

export interface CreateChatParams {
  chatId: string;
  participants: User[];
}

export interface ParticipantRowsParams {
  currentUserId: string;
}

export interface ParticipantRowsParamsResponse {
  id: string;
  chatId: string;
  userId: string;
}

export interface ChatDataParams {
  chatId: string;
}

export interface ChatDataResponse {
  id: string;
}

export interface ParticipantDataParams extends ChatDataParams {}

export interface ParticipantDataResponse
  extends ParticipantRowsParamsResponse {}

export interface MessageDataParams extends ChatDataParams {
  page?: number;
}

export interface ChatRepository {
  createChat: ({ chatId, participants }: CreateChatParams) => Promise<boolean>;
  participantRows: ({
    currentUserId,
  }: ParticipantRowsParams) => Promise<ChatDataParams[]>;
  chatData: ({ chatId }: ParticipantDataParams) => Promise<ChatDataResponse[]>;
  participantData: ({
    chatId,
  }: ChatDataParams) => Promise<ParticipantDataResponse[]>;
  messagesData: ({ chatId, page }: MessageDataParams) => Promise<Message[]>;
}

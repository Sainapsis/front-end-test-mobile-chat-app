import { Message } from '@/src/domain/entities/message';

export interface CreateChatParams {
  chatId: string;
  participantIds: string[];
}

export interface ParticipantRowsParams {
  currentUserId: string;
}

export interface ParticipantRowsParamsResponse {
  id: string;
  chatId: string;
  userId: string;
};

export interface ChatsDataParams {
  chatId: string;
}

export interface ChatsDataResponse {
  id: string;
}

export interface ParticipantDataParams extends ChatsDataParams { }

export interface ParticipantDataResponse extends ParticipantRowsParamsResponse { }
 
export interface MessageDataParams extends ChatsDataParams {}

export interface ChatsRepository {
  createChat: ({ chatId, participantIds }: CreateChatParams) => Promise<void>;
  participantRows: ({ currentUserId }: ParticipantRowsParams) => Promise<ParticipantRowsParamsResponse[]>;
  chatData: ({ chatId }: ParticipantDataParams) => Promise<ChatsDataResponse[]>;
  participantData: ({ chatId }: ChatsDataParams) => Promise<ParticipantDataResponse[]>;
  messagesData: ({ chatId }: MessageDataParams) => Promise<Message[]>;
}

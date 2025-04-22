import { Chat, Message, Media } from './chatTypes';

export interface IChatRepository {
  createChat(participantIds: string[]): Promise<Chat | null>;
  loadChats(userId: string): Promise<Chat[]>;
  sendMessage(chatId: string, text: string, senderId: string, media?: Media | null): Promise<Message>;
  markMessageAsRead(messageId: string, userId: string): Promise<boolean>;
  deleteMessage(messageId: string, chatId: string): Promise<boolean>;
}

export class ChatError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ChatError';
  }
} 
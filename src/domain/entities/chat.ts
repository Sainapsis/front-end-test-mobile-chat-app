import { Message } from './message';

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
}
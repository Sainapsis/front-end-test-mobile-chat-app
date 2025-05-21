import { User } from './user';

export enum MessageStatus {
  Sent = 'sent',
  Read = 'read',
  Delivered = 'delivered',
}

export interface Message {
  id: string;
  senderId: string;
  text: string | null;
  imageUri: string | null;
  timestamp: number;
  status: MessageStatus;
  sender?: User;
}
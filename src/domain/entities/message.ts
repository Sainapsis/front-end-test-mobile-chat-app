export enum MessageStatus {
  Sent = 'sent',
  Read = 'read',
  Delivered = 'delivered',
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageUri?: string;
  timestamp: number;
  status: MessageStatus;
}
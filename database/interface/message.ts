export enum MessageStatus {
  SENT = 'sent',
  READ = 'read',
  DELIVERED = 'delivered',
}
export interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageUri?: string;
  timestamp: number;
  status: MessageStatus;
}
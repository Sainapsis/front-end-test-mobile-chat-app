export interface MessageReaction {
  id: string;
  userId: string;
  emoji: string;
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  reactions: MessageReaction[];
  editedAt?: number;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
}
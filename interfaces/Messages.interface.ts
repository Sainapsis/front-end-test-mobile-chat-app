export interface SendMessageInterface {
  chatId: string;
  text: string;
  senderId: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  status: "sent" | "read";
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
}

export interface SetMessageAsReadInterface {
  id: string;
  chatId: string;
}

export interface MessageBubbleProps {
  message: Message;
  chatId: string;
  isCurrentUser: boolean;
}

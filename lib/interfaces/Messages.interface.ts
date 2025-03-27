import { UserInterface } from "@/interfaces/User.interface";

export interface SendMessageInterface {
  chatId: string;
  text: string;
  senderId: string;
}

export interface MessageInterface {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  status: "sent" | "read";
  reaction?: string;
}

export interface ChatInterface {
  id: string;
  participants: string[];
  messages: MessageInterface[];
  lastMessage?: MessageInterface;
}

export interface SetMessageAsReadProps {
  id: string;
  chatId: string;
}

export interface DeleteMessageProps {
  chatId: string;
  messageId: string;
}

export interface EditMessageProps {
  chatId: string;
  messageId: string;
  newText: string;
}

export interface ForwardMessageProps {
  senderId: string;
  targetChatId: string;
  targetUserId: string;
  messageId: string;
}

export interface AddReactionToMessageProps {
  chatId: string;
  messageId: string;
  reaction: string;
}

export interface handleCreateChatProps {
  currentUser: UserInterface | null;
  createChat: (participants: string[]) => void;
  chats: ChatInterface[];
  selectedUsers: string[];
  setModalVisible: (visible: boolean) => void;
  setSelectedUsers: (users: string[]) => void;
}

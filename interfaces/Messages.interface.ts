import { User } from "@/hooks/useUser";

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

export interface SetMessageAsReadProps {
  id: string;
  chatId: string;
}

export interface MessageBubbleProps {
  message: Message;
  chatId: string;
  isCurrentUser: boolean;
}

export interface handleCreateChatProps {
  currentUser: User | null;
  createChat: (participants: string[]) => void;
  chats: Chat[];
  selectedUsers: string[];
  setModalVisible: (visible: boolean) => void;
  setSelectedUsers: (users: string[]) => void;
}

export interface isChatAlreadyCreatedProps {
  participants: string[];
  chats: Chat[];
  selectedUsers: string[];
}

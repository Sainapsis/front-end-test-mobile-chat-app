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

export interface EmojisToReactProps {
  handleReaction: (reaction: string) => void;
  setShowReactions: (show: boolean) => void;
}

export interface SetMessageAsReadInterface {
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

export interface MessageBubbleProps {
  message: MessageInterface;
  chatId: string;
  isCurrentUser: boolean;
}

export interface MessageOptionsProps {
  handleDeleteMessage: () => void;
  setShowInputToEditMessage: (show: boolean) => void;
  setShowMessageOptions: (show: boolean) => void;
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

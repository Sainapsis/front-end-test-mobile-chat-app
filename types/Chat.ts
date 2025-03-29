/**
 * Represents a reaction to a message
 */
export interface MessageReaction {
  /** Unique identifier for the reaction */
  id: string;
  /** ID of the user who added the reaction */
  userId: string;
  /** Emoji representing the reaction */
  emoji: string;
  /** Timestamp when the reaction was created */
  createdAt: number;
}

/**
 * Represents a message in a chat
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;
  /** ID of the user who sent the message */
  senderId: string;
  /** Content of the message */
  text: string;
  /** Timestamp when the message was sent */
  timestamp: number;
  /** List of reactions to the message */
  reactions: MessageReaction[];
  /** Optional timestamp when the message was last edited */
  editedAt?: number;
}

/**
 * Represents a chat conversation
 */
export interface Chat {
  /** Unique identifier for the chat */
  id: string;
  /** List of participant user IDs */
  participants: string[];
  /** List of messages in the chat */
  messages: Message[];
  /** Optional reference to the last message in the chat */
  lastMessage?: Message;
}
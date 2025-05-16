import { Message } from "../hooks/useChatRoomMessage";

export interface ChatWithDetails {
  id: string;
  participants: string[];
  lastMessage?: Message;
}

export const mapMessageFromDB = (dbMessage: any): Message => {
  if(typeof dbMessage === 'string'){
    try {
      dbMessage = JSON.parse(dbMessage);
    } catch (error) {
      console.warn("Error parsing message:", dbMessage, error);
    }
  }
  let readBy: string[] = [];
  try {
    readBy = JSON.parse(dbMessage.readBy || "[]");
  } catch (error) {
    console.warn("Error parsing readBy for message:", dbMessage.id, error);
    readBy = [];
  }

  return {
    id: dbMessage.id,
    senderId: dbMessage.senderId,
    chatId: dbMessage.chatId,
    text: dbMessage.text,
    timestamp: dbMessage.timestamp,
    status: dbMessage.status || "sent",
    readBy,
    isEdited: dbMessage.isEdited || false,
    isDeleted: dbMessage.isDeleted || false,
    editedAt: dbMessage.editedAt || undefined,
    deletedAt: dbMessage.deletedAt || undefined,
    originalText: dbMessage.originalText || undefined,
  };
};

export const mapChatFromDB = (dbChat: any): ChatWithDetails => {
  return {
    id: dbChat.id,
    participants: dbChat.participants.split(",") || [],
    lastMessage: dbChat.lastMessage
      ? mapMessageFromDB(dbChat.lastMessage)
      : undefined,
  };
};

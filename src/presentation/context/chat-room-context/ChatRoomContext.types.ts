// import {
//   DeleteMessageParams,
//   EditMessageParams,
// } from "@/src/data/interfaces/chat.interface";
// import { Chat } from "@/src/domain/entities/chat";
// import { Message } from "@/src/domain/entities/message";

// export interface ChatRoomContextType {
  // loading: boolean;
  // chat: Chat | null;
  // loadChat: ({ chatId }: { chatId: string }) => Promise<void>;
  // updateMessageToReadStatus: ({
  //   currentUserId,
  // }: {
  //   currentUserId: string;
  // }) => Promise<void>;
  // sendMessage: (chatId: string, message: Message) => Promise<boolean>;
  // editMessage: ({
  //   chatId,
  //   messageId,
  //   newText,
  // }: EditMessageParams) => Promise<boolean>;
  // deleteMessage: ({
  //   chatId,
  //   messageId,
  // }: DeleteMessageParams) => Promise<boolean>;
  // updateMessageToDeliveredStatus: ({
  //   currentUserId,
  // }: {
  //   currentUserId: string;
  // }) => Promise<void>;
  // handleLoadMoreMessage: ({ chatId }: { chatId: string }) => Promise<void>;
// }

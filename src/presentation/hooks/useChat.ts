import { UpdateStatusMessageParams } from "@/src/data/interfaces/chat.interface";
import { chatRepository } from "@/src/data/repositories/chat.repository";
import { Chat } from "@/src/domain/entities/chat";
import { Message, MessageStatus } from '@/src/domain/entities/message';
import { updateStatusMessage } from "@/src/domain/usecases/chat.usecase";
import { useState } from "react";

export function useChat() {
  const [userChats, setUserChats] = useState<Chat[]>([]);

  const updateStatus = async (currentUserId: string, chat: Chat, statusMessage: MessageStatus) => {
    const unreadMessages = chat.messages.filter(
      ({ senderId }: Message) => senderId !== currentUserId
    );

    await Promise.all(
      unreadMessages.map(({ id }: Message) =>
        updateMessageStatus(chat.id, {
          messageId: id,
          status: statusMessage,
        })
      )
    );
  };

  const updateMessageStatus = async (
    chatId: string,
    { messageId, status }: UpdateStatusMessageParams
  ) => {   
    console.log("this is the status", {
      messageId,
      status,
    });
    
    try {
      await updateStatusMessage(chatRepository)({
        messageId,
        status,
      });

      const chats = userChats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: chat.messages.map((message) => {
              if (message.id === messageId) {
                return {
                  ...message,
                  status: status,
                };
              }
              return message;
            }),
          };
        }
        return chat;
      });
      setUserChats(chats);
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  };

  return {
    userChats,
    updateStatus,
    updateMessageStatus,
  };
}

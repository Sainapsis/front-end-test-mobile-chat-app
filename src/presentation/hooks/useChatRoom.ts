import {
  DeleteMessageParams,
  EditMessageParams,
  UpdateStatusMessageParams,
} from "@/src/data/interfaces/chatRoom.interface";
import { chatRoomRepository } from "@/src/data/repositories/chatRoom.repository";
import { Chat } from "@/src/domain/entities/chat";
import { Message } from "@/src/domain/entities/message";
import {
  deleteMessage,
  editMessage,
  sendMessage,
  updateStatusMessage,
} from "@/src/domain/usecases/chatRoom.usecase";
import { getChatByIDDB } from "@/src/infrastructure/database/chatRoom.database";
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useChats } from "./useChats";

export function useChatRoom({ chatId }: { chatId: string }) {
  const { currentUser } = useAuthContext();
  const { setSortedChats } = useChats({
    currentUserId: currentUser?.id || null,
  });
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;

    loadChat({ chatId });
  }, [currentUser]);

  const loadChat = async ({ chatId }: { chatId: string }) => {
    const chat = await getChatByIDDB({
      chatId: chatId,
      currentUserId: currentUser?.id || "",
    });
    setLoading(false);
    setChat(chat);
  };

  const sendMessageImpl = useCallback(
    async (chatId: string, message: Message) => {
      if (!message.text?.trim() && !message.imageUri) return false;

      try {
        await sendMessage(chatRoomRepository)({ chatId, message });

        setSortedChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [message, ...chat.messages],
                lastMessage: message,
              };
            }
            return chat;
          });
        });

        setChat(
          (prevChat) =>
            prevChat && {
              ...prevChat,
              messages: [message, ...prevChat.messages],
              lastMessage: message,
            }
        );
        return true;
      } catch (error) {
        console.error("Error sending message:", error);
        return false;
      }
    },
    []
  );

  const updateMessageStatusImpl = useCallback(
    async (
      chatId: string,
      { messageId, status }: UpdateStatusMessageParams
    ) => {
      try {
        await updateStatusMessage(chatRoomRepository)({
          messageId,
          status,
        });

        setSortedChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.id === chatId) {
              const updatedMessages = chat.messages.map((msg) =>
                msg.id === messageId ? { ...msg, status } : msg
              );

              const lastMessage =
                updatedMessages.length > 0
                  ? updatedMessages[updatedMessages.length - 1]
                  : undefined;

              return {
                ...chat,
                messages: updatedMessages,
                lastMessage,
              };
            }
            return chat;
          });
        });
      } catch (error) {
        console.error("Error updating message status:", error);
      }
    },
    []
  );

  const deleteMessageImpl = useCallback(
    async ({ chatId, messageId }: DeleteMessageParams) => {
      try {
        await deleteMessage(chatRoomRepository)({
          chatId,
          messageId,
        });

        setSortedChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.id === chatId) {
              const updatedMessages = chat.messages.filter(
                (msg) => msg.id !== messageId
              );

              const lastMessage =
                updatedMessages.length > 0
                  ? updatedMessages[updatedMessages.length - 1]
                  : undefined;

              return {
                ...chat,
                messages: updatedMessages,
                lastMessage,
              };
            }
            return chat;
          });
        });

        return true;
      } catch (error) {
        console.error("Error deleting message status:", error);
        return false;
      }
    },
    []
  );

  const editMessageImpl = useCallback(
    async ({ chatId, messageId, newText }: EditMessageParams) => {
      try {
        await editMessage(chatRoomRepository)({
          chatId,
          messageId,
          newText,
        });

        setSortedChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.id === chatId) {
              const updatedMessages = chat.messages.map((msg) =>
                msg.id === messageId ? { ...msg, text: newText } : msg
              );

              const lastMessage =
                updatedMessages.length > 0
                  ? updatedMessages[updatedMessages.length - 1]
                  : undefined;

              return {
                ...chat,
                messages: updatedMessages,
                lastMessage,
              };
            }
            return chat;
          });
        });

        return true;
      } catch (error) {
        console.error("Error editing message status:", error);
        return false;
      }
    },
    []
  );

  const handleLoadMoreMessageImpl = useCallback(
    async ({ chatId }: { chatId: string }) => {
      try {
        console.log("handleLoadMoreMessage called");
      } catch (error) {
        console.error("Error loading older messages:", error);
      }
    },
    []
  );

  return {
    loading,
    chat,
    sendMessage: sendMessageImpl,
    editMessage: editMessageImpl,
    deleteMessage: deleteMessageImpl,
    updateMessageStatus: updateMessageStatusImpl,
    handleLoadMoreMessage: handleLoadMoreMessageImpl,
  };
}

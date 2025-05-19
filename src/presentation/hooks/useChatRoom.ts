import {
  DeleteMessageParams,
  EditMessageParams,
} from "@/src/data/interfaces/chat.interface";
import { chatRepository } from "@/src/data/repositories/chat.repository";
import { Chat } from "@/src/domain/entities/chat";
import { Message, MessageStatus } from "@/src/domain/entities/message";
import {
  deleteMessage,
  editMessage,
  sendMessage,
  updateStatusMessage,
} from "@/src/domain/usecases/chat.usecase";
import { useCallback, useState } from "react";
import { useChatContext } from "../context/chat-context/ChatContext";
import { getChatByIDDB } from "@/src/infrastructure/database/chat.database";
import { useAuthContext } from "../context/auth-context/AuthContext";
import { useUserContext } from "../context/user-context/UserContext";
import { User } from "@/src/domain/entities/user";

export function useChatRoom() {
  const { userChats, setUserChats } = useChatContext();
  const { currentUser } = useAuthContext();
  const { users } = useUserContext();

  const [chatParticipants, setChatParticipants] = useState<
    (User | undefined)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState<Chat | null>(null);

  const loadChatImpl = async ({ chatId }: { chatId: string }) => {
    if (!userChats) {
      setChat(null);
      return;
    }

    try {
      const chat = await getChatByIDDB({
        chatId,
        currentUserId: currentUser?.id ?? "",
      });

      const participants =
        chat?.participants
          .filter((id: string) => id !== currentUser?.id)
          .map((id: string) => users.find((user) => user.id === id))
          .filter(Boolean) ?? [];

      setChat(chat);
      setChatParticipants(participants);
      setLoading(false);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  const updateMessageToReadStatusImpl = useCallback(
    async ({ currentUserId }: { currentUserId: string }) => {
      if (!chat || !currentUserId) return;

      try {
        const unreadMessages = chat.messages.filter(
          ({ senderId, status }: Message) =>
            senderId !== currentUserId && status === MessageStatus.Delivered
        );

        unreadMessages.map(async (msg) => {
          await updateStatusMessage(chatRepository)({
            messageId: msg.id,
            status: MessageStatus.Read,
          });
        });

        // Actualiza la lista de chats
        setUserChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.id === chat.id) {
              return {
                ...chat,
                messages: chat.messages.map((msg) => {
                  if (msg.senderId !== currentUserId) {
                    return {
                      ...msg,
                      status: MessageStatus.Read,
                    };
                  }
                  return msg;
                }),
              };
            }
            return chat;
          });
        });
      } catch (error) {
        console.error("Error updating to read message status:", error);
      }
    },
    [chat]
  );

  const sendMessageImpl = useCallback(
    async (chatId: string, message: Message) => {
      if (!message.text?.trim() && !message.imageUri) return false;

      try {
        await sendMessage(chatRepository)({ chatId, message });

        setChat((prevChat) => {
          if (prevChat?.id === chatId) {
            return {
              ...prevChat,
              messages: [message, ...prevChat.messages],
              lastMessage: message,
            };
          }
          return prevChat;
        });

        setUserChats((prevChats) => {
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

        return true;
      } catch (error) {
        console.error("Error sending message:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateMessageToDeliveredStatusImpl = useCallback(
    async ({ currentUserId }: { currentUserId: string }) => {
      try {
        userChats.map((chat) => {
          const undeliveredMessages = chat.messages.filter(
            ({ senderId, status }: Message) =>
              senderId !== currentUserId && status === MessageStatus.Sent
          );

          undeliveredMessages.map(async (msg) => {
            await updateStatusMessage(chatRepository)({
              messageId: msg.id,
              status: MessageStatus.Delivered,
            });
          });
        });
      } catch (error) {
        console.error("Error updating message status:", error);
      } finally {
        setLoading(false);
      }
    },
    [userChats]
  );

  const deleteMessageImpl = useCallback(
    async ({ chatId, messageId }: DeleteMessageParams) => {
      try {
        await deleteMessage(chatRepository)({
          chatId,
          messageId,
        });

        setChat((prevChat) => {
          if (prevChat?.id === chatId) {
            return {
              ...prevChat,
              messages: prevChat.messages.filter((msg) => msg.id !== messageId),
            };
          }
          return prevChat;
        });

        setUserChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.filter((msg) => msg.id !== messageId),
              };
            }
            return chat;
          });
        });

        return true;
      } catch (error) {
        console.error("Error deleting message status:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const editMessageImpl = useCallback(
    async ({ chatId, messageId, newText }: EditMessageParams) => {
      try {
        await editMessage(chatRepository)({
          chatId,
          messageId,
          newText,
        });

        //         setSortedUserChats((prevChats) => {
        //           return prevChats.map((chat) => {
        //             if (chat.id === chatId) {
        //               const updatedMessages = chat.messages.map((msg) =>
        //                 msg.id === messageId ? { ...msg, text: newText } : msg
        //               );
        //
        //               const lastMessage =
        //                 updatedMessages.length > 0
        //                   ? updatedMessages[updatedMessages.length - 1]
        //                   : undefined;
        //
        //               return {
        //                 ...chat,
        //                 messages: updatedMessages,
        //                 lastMessage,
        //               };
        //             }
        //             return chat;
        //           });
        //         });

        return true;
      } catch (error) {
        console.error("Error editing message status:", error);
        return false;
      } finally {
        setLoading(false);
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
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    chat,
    chatParticipants,
    loadChat: loadChatImpl,
    updateMessageToReadStatus: updateMessageToReadStatusImpl,
    sendMessage: sendMessageImpl,
    editMessage: editMessageImpl,
    deleteMessage: deleteMessageImpl,
    updateMessageToDeliveredStatus: updateMessageToDeliveredStatusImpl,
    handleLoadMoreMessage: handleLoadMoreMessageImpl,
  };
}

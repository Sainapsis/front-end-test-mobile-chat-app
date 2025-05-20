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
import {
  getChatByIDDB,
  messagesDataDB,
} from "@/src/infrastructure/database/chat.database";
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatName, setChatName] = useState<String | undefined>(undefined);

  const loadChatImpl = async ({ chatId }: { chatId: string }) => {
    if (!userChats) {
      setChat(null);
      return;
    }

    try {
      const chat = await getChatByIDDB({
        chatId,
      });

      if (chat) {
        setChat(chat);
      }

      const participants = chat?.participants
        .filter((id: string) => id !== currentUser?.id)
        .map((id: string) => users.find((user) => user.id === id));

      setChatParticipants(participants);

      setChatName(
        participants.length === 0
          ? "No participants"
          : participants.length === 1
          ? participants[0]?.name
          : `${participants[0]?.name} & ${participants.length - 1} other${
              participants.length > 2 ? "s" : ""
            }`
      );

      const _messages = await messagesDataDB({ chatId });

      if (_messages) {
        setMessages(_messages);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  const updateMessageToReadStatusImpl = useCallback(
    async ({ currentUserId }: { currentUserId: string }) => {
      if (!chat || !currentUserId) return;

      try {
        await Promise.all(
          messages.map(async ({ id, senderId, status }: Message) => {
            if (
              senderId !== currentUserId &&
              status === MessageStatus.Delivered
            ) {
              await updateStatusMessage(chatRepository)({
                messageId: id,
                status: MessageStatus.Read,
              });
            }
          })
        );

        setUserChats((prevChats) => {
          return prevChats.map((_chat) => {
            if (chat && _chat.id === chat.id && _chat.lastMessage) {
              return {
                ..._chat,
                lastMessage: {
                  ..._chat.lastMessage,
                  status: MessageStatus.Read,
                  id: _chat.lastMessage.id,
                  senderId: _chat.lastMessage.senderId,
                  text: _chat.lastMessage.text,
                  imageUri: _chat.lastMessage.imageUri,
                  timestamp: _chat.lastMessage.timestamp,
                },
              };
            }
            return _chat;
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

        setMessages((prevMessages) => [message, ...prevMessages]);
        setUserChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
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
        await Promise.all(
          userChats.map(async (chat) => {
            const undeliveredMessages = await messagesDataDB({
              chatId: chat.id,
            }).then((messages) => {
              return messages.filter(
                ({ senderId, status }: Message) =>
                  senderId !== currentUserId && status === MessageStatus.Sent
              );
            });

            await Promise.all(
              undeliveredMessages.map((msg) =>
                updateStatusMessage(chatRepository)({
                  messageId: msg.id,
                  status: MessageStatus.Delivered,
                })
              )
            );
          })
        );
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

        // setMessages((prevMessages) =>
          // prevMessages.filter((msg) => msg.id !== messageId)
        // );
        // setUserChats((prevChats) => {
        //   return prevChats.map((chat) => {
        //     if (chat.id === chatId) {
        //       return {
        //         ...chat,
        //         lastMessage: undefined,
        //       };
        //     }
        //     return chat;
        //   });
        // });

        return true;
      } catch (error) {
        console.error("Error deleting message status:", error);
        return false;
      } finally {
        setLoading(false);
      }
    }, []
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
    chatName,
    messages,
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

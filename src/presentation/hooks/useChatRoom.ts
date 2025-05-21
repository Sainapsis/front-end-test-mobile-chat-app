import { Chat } from "@/src/domain/entities/chat";
import { Message, MessageStatus } from "@/src/domain/entities/message";
import { useCallback, useState } from "react";
import { useChatContext } from "../context/chat-context/ChatContext";
import { useAuthContext } from "../context/auth-context/AuthContext";
import { User } from "@/src/domain/entities/user";
import {
  deleteMessage,
  editMessage,
  getChatByID,
  sendMessage,
  updateStatusMessage,
} from "@/src/domain/usecases/chatRoom.usecase";
import { chatRoomRepository } from "@/src/data/repositories/chatRoom.repository";
import { messagesData } from "@/src/domain/usecases/chat.usecase";
import { chatRepository } from "@/src/data/repositories/chat.repository";
import {
  DeleteMessageParams,
  EditMessageParams,
} from "@/src/data/interfaces/chatRoom.interface";

export function useChatRoom() {
  const { userChats, setUserChats } = useChatContext();
  const { currentUser } = useAuthContext();

  const [chatParticipants, setChatParticipants] = useState<
    (User | undefined)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatName, setChatName] = useState<String | undefined>(undefined);
  const [page, setPage] = useState<number>(1);

  const loadChatImpl = async ({ chatId }: { chatId: string }) => {
    if (!userChats) {
      setChat(null);
      return;
    }

    try {
      const chat = await getChatByID(chatRoomRepository)({
        chatId,
      });

      if (chat) {
        setChat(chat);
      }

      const participants =
        chat?.participants.filter(
          (participant) => participant.id !== currentUser?.id
        ) ?? [];

      setChatParticipants(participants);

      if (participants.length === 0) {
        setChatName("No participants");
      } else if (participants.length === 1) {
        setChatName(participants[0]?.name);
      } else {
        setChatName(
          `${participants[0]?.name} & ${participants.length - 1} other${
            participants.length > 2 ? "s" : ""
          }`
        );
      }

      const _messages = await messagesData(chatRepository)({ chatId });

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
        const data = await updateStatusMessage(chatRoomRepository)({
          currentUserId,
          statusToUpdate: MessageStatus.Read,
          currentStatus: MessageStatus.Delivered,
        });

        if (!data) return;

        setUserChats((prevChats) => {
          return prevChats.map((_chat) => {
            if (
              _chat.id === chat.id &&
              _chat.messages[_chat.messages.length - 1] &&
              _chat.messages[_chat.messages.length - 1].status ===
                MessageStatus.Delivered &&
              _chat.messages[_chat.messages.length - 1].senderId !==
                currentUserId
            ) {
              return {
                ..._chat,
                messages: _chat.messages.map((msg) => {
                  if (
                    msg.id === _chat.messages[_chat.messages.length - 1].id
                  ) {
                    return {
                      ...msg,
                      status: MessageStatus.Read,
                    };
                  }
                  return msg;
                }),
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
        await sendMessage(chatRoomRepository)({ chatId, message });

        setMessages((prevMessages) => [message, ...prevMessages]);

        setUserChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [...chat.messages, message],
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
            const data = await updateStatusMessage(chatRoomRepository)({
              currentUserId,
              statusToUpdate: MessageStatus.Delivered,
              currentStatus: MessageStatus.Sent,
            });

            if (!data) return;

            setUserChats((prevChats) => {
              return prevChats.map((_chat) => {
                if (
                  _chat.id === chat.id &&
                  _chat.messages[_chat.messages.length - 1] &&
                  _chat.messages[_chat.messages.length - 1].status ===
                    MessageStatus.Sent &&
                  _chat.messages[_chat.messages.length - 1].senderId !==
                    currentUserId
                ) {
                  return {
                    ..._chat,
                    messages: _chat.messages.map((msg) => {
                      if (
                        msg.id === _chat.messages[_chat.messages.length - 1].id
                      ) {
                        return {
                          ...msg,
                          status: MessageStatus.Delivered,
                        };
                      }
                      return msg;
                    }),
                  };
                }
                return _chat;
              });
            });
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
        await deleteMessage(chatRoomRepository)({
          chatId,
          messageId,
        });

        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageId)
        );

        const _messages = await messagesData(chatRepository)({ chatId });

        setUserChats((prevChats) => {
          return prevChats.map((_chat) => {
            if (_chat.id === chatId) {
              return {
                ..._chat,
                messages: _messages.reverse() ?? [],
              };
            }
            return _chat;
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
        await editMessage(chatRoomRepository)({
          chatId,
          messageId,
          newText,
        });

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, text: newText } : msg
          )
        );

        setUserChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.id === chatId) {
              if (chat.messages[chat.messages.length - 1]?.id === messageId) {
                return {
                  ...chat,
                  messages: chat.messages.map((msg) => {
                    if (msg.id === messageId) {
                      return {
                        ...msg,
                        text: newText,
                      };
                    }
                    return msg;
                  }),
                };
              }
            }
            return chat;
          });
        });

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
        const _messages = await messagesData(chatRepository)({ chatId, page });

        if (_messages.length > 0) {
          setMessages((prevMessages) => {
            const newMessages = _messages.filter(
              ({ id }: Message) =>
                !prevMessages.some((prevMsg) => prevMsg.id === id)
            );
            return [...prevMessages, ...newMessages];
          });

          setPage(page + 1);
        }
      } catch (error) {
        console.error("Error loading older messages:", error);
      } finally {
        setLoading(false);
      }
    },
    [page]
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

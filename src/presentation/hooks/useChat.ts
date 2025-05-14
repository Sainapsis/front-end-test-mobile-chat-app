import {
  CreateChatParams,
  DeleteMessageParams,
  EditMessageParams,
  UpdateStatusMessageParams,
} from "@/src/data/interfaces/chat.interface";
import { chatRepository } from "@/src/data/repositories/chat.repository";
import { Chat } from "@/src/domain/entities/chat";
import { Message, MessageStatus } from "@/src/domain/entities/message";
import {
  chatData,
  createChat,
  deleteMessage,
  editMessage,
  messagesData,
  participantData,
  participantRows,
  sendMessage,
  updateStatusMessage,
} from "@/src/domain/usecases/chat.usecase";
import { useCallback, useEffect, useState } from "react";

export function useChat({ currentUserId }: { currentUserId: string | null }) {
  const [loading, setLoading] = useState(true);
  const [userChats, setUserChats] = useState<Chat[]>([]);

  useEffect(() => {
    const loadChats = async () => {
      if (!currentUserId) {
        setUserChats([]);
        setLoading(false);
        return;
      }

      try {
        const rowsParticipant = await participantRows(chatRepository)({
          currentUserId,
        });

        const chatIds = rowsParticipant.map((row) => row.chatId);

        if (chatIds.length === 0) {
          setUserChats([]);
          setLoading(false);
          return;
        }

        const loadedChats: Chat[] = [];

        for (const chatId of chatIds) {
          const dataChat = await chatData(chatRepository)({ chatId });

          if (dataChat.length === 0) continue;

          const participantsData = await participantData(chatRepository)({
            chatId,
          });

          const participantIds = participantsData.map((p) => p.userId);

          const dataMessages = await messagesData(chatRepository)({ chatId });

          const chatMessages = dataMessages.map((message) => ({
            id: message.id,
            senderId: message.senderId,
            text: message.text,
            imageUri: message.imageUri ?? null,
            timestamp: message.timestamp,
            status: message.status as MessageStatus,
          }));

          const lastMessage =
            chatMessages.length > 0 ? chatMessages[0] : undefined;

          loadedChats.push({
            id: chatId,
            participants: participantIds,
            messages: chatMessages as Message[],
            lastMessage: lastMessage as Message | undefined,
          });
        }

        setUserChats(loadedChats);
      } catch (error) {
        console.error("Error loading chats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [currentUserId]);

  const updateStatus = async (
    currentUserId: string,
    chat: Chat,
    statusMessage: MessageStatus
  ) => {
    const unreadMessages = chat.messages.filter(
      ({ senderId, status }: Message) =>
        senderId !== currentUserId && status !== statusMessage
    );

    await Promise.all(
      unreadMessages.map(({ id }: Message) =>
        updateMessageStatusImpl(chat.id, {
          messageId: id,
          status: statusMessage,
        })
      )
    );
  };

  const createChatImpl = useCallback(
    async ({ chatId, participantIds }: CreateChatParams) => {
      if (!currentUserId || !participantIds.includes(currentUserId)) {
        return null;
      }

      try {
        await createChat(chatRepository)({ chatId, participantIds });

        const newChat: Chat = {
          id: chatId,
          participants: participantIds,
          messages: [],
        };

        setUserChats((prevChats) => [...prevChats, newChat]);
        return newChat;
      } catch (error) {
        console.error("Error creating chat:", error);
        return null;
      }
    },
    []
  );

  const sendMessageImpl = useCallback(
    async (chatId: string, message: Message) => {
      if (!message.text?.trim() && !message.imageUri) return false;

      try {
        await sendMessage(chatRepository)({ chatId, message });

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
        await updateStatusMessage(chatRepository)({
          messageId,
          status,
        });

        setUserChats((prevChats) => {
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
        await deleteMessage(chatRepository)({
          chatId,
          messageId,
        });

        setUserChats((prevChats) => {
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
        await editMessage(chatRepository)({
          chatId,
          messageId,
          newText,
        });

        setUserChats((prevChats) => {
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

  const handleLoadMoreMessageImpl = useCallback(async (chatId: string) => {
    try {
      console.log("handleLoadMoreMessage called");
    } catch (error) {
      console.error("Error loading older messages:", error);
    }
  }, []);

  return {
    loading,
    userChats,
    updateStatus,
    createChat: createChatImpl,
    sendMessage: sendMessageImpl,
    editMessage: editMessageImpl,
    deleteMessage: deleteMessageImpl,
    updateMessageStatus: updateMessageStatusImpl,
    handleLoadMoreMessage: handleLoadMoreMessageImpl,
  };
}

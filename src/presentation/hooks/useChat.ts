import { CreateChatParams } from "@/src/data/interfaces/chat.interface";
import { chatRepository } from "@/src/data/repositories/chat.repository";
import { Chat } from "@/src/domain/entities/chat";
import { createChat } from "@/src/domain/usecases/chat.usecase";
import { useCallback, useEffect, useState } from "react";
import { useChatContext } from "../context/chat-context/ChatContext";
import { getAllUserChatsDB } from "@/src/infrastructure/database/chat.database";

export function useChat({ currentUserId }: { currentUserId: string | null }) {
  const { userChats, setUserChats } = useChatContext();

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    loadChatsImpl();
  }, []);

  const loadChatsImpl = async () => {
    if (!currentUserId) {
      setUserChats([]);
      return;
    }

    try {
      const chats = await getAllUserChatsDB({
        currentUserId,
        page: 0,
      });

      setUserChats(chats);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const createChatImpl = useCallback(
    async ({ chatId, participants }: CreateChatParams) => {
      if (
        !currentUserId ||
        !participants.some((user) => user.id === currentUserId)
      ) {
        return null;
      }

      try {
        await createChat(chatRepository)({ chatId, participants });

        const newChat: Chat = {
          id: chatId,
          participants,
          messages: [],
        };

        setUserChats((prevChats) => [newChat, ...prevChats]);
        return newChat;
      } catch (error) {
        console.error("Error creating chat:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleLoadMoreChatsImpl = useCallback(async () => {
    if (!currentUserId) {
      setUserChats([]);
      return;
    }

    try {
      const _chats = await getAllUserChatsDB({ currentUserId, page });

      if (_chats) {
        setUserChats((prevChats) => {
          const newChats = _chats.filter(
            ({ id }: Chat) => !prevChats.some((prevChat) => prevChat.id === id)
          );
          return [...prevChats, ...newChats];
        });

        setPage(page + 1);
      }
    } catch (error) {
      console.error("Error loading more chats:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  return {
    loading,
    userChats,
    createChat: createChatImpl,
    handleLoadMoreChats: handleLoadMoreChatsImpl,
  };
}

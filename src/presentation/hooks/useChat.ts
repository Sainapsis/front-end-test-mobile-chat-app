import { CreateChatParams } from "@/src/data/interfaces/chat.interface";
import { chatRepository } from "@/src/data/repositories/chat.repository";
import { Chat } from "@/src/domain/entities/chat";
import { createChat } from "@/src/domain/usecases/chat.usecase";
import { useCallback, useEffect } from "react";
import { useChatContext } from "../context/chat-context/ChatContext";
import { getAllUserChatsDB } from "@/src/infrastructure/database/chat.database";

export function useChat({ currentUserId }: { currentUserId: string | null }) {
  const { userChats, setUserChats } = useChatContext();

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
      });

      setUserChats(chats);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
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
        };

        setUserChats((prevChats) => [newChat, ...prevChats]);
        return newChat;
      } catch (error) {
        console.error("Error creating chat:", error);
        return null;
      }
    },
    []
  );

  return {
    userChats,
    createChat: createChatImpl,
  };
}

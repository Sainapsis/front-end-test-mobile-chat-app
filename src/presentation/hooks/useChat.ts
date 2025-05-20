import { CreateChatParams } from "@/src/data/interfaces/chat.interface";
import { chatRepository } from "@/src/data/repositories/chat.repository";
import { Chat } from "@/src/domain/entities/chat";
import { Message } from "@/src/domain/entities/message";
import {
  chatData,
  createChat,
  messagesData,
  participantData,
  participantRows,
} from "@/src/domain/usecases/chat.usecase";
import { useCallback, useEffect } from "react";
import { useChatContext } from '../context/chat-context/ChatContext';

export function useChat({ currentUserId }: { currentUserId: string | null; }) {
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
      const chatIds = await participantRows(chatRepository)({
        currentUserId,
      });

      if (chatIds.length === 0) {
        setUserChats([]);
        return;
      }

      const loadedChats: Chat[] = [];

      for (const chatId of chatIds) {
        const dataChat = await chatData(chatRepository)({ chatId: chatId.chatId });

        if (dataChat.length === 0) continue;

        const participantsData = await participantData(chatRepository)(
          { chatId: chatId.chatId }
        );

        const participantIds = participantsData.map((p) => p.userId);

        const dataMessages = await messagesData(chatRepository)(
          { chatId: chatId.chatId }
        );

        const lastMessage =
          dataMessages.length > 0 ? dataMessages[0] : undefined;

        loadedChats.push({
          id: chatId.chatId,
          participants: participantIds,
          lastMessage: lastMessage as Message | undefined,
        });
      }

      setUserChats(
        loadedChats
        //   .sort((a, b) => {
        //   const aLast = a.messages[a.messages.length - 1];
        //   const bLast = b.messages[b.messages.length - 1];
        //   const aTime = aLast ? new Date(aLast.timestamp).getTime() : 0;
        //   const bTime = bLast ? new Date(bLast.timestamp).getTime() : 0;
        //   return bTime - aTime;
        // })
      );
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
        
        // setUserChats(
        //   [...userChats, newChat].sort((a, b) => {
        //     const aLast = a.messages[a.messages.length - 1];
        //     const bLast = b.messages[b.messages.length - 1];
        //     const aTime = aLast ? new Date(aLast.timestamp).getTime() : 0;
        //     const bTime = bLast ? new Date(bLast.timestamp).getTime() : 0;
        //     return bTime - aTime;
        //   })
        // );
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

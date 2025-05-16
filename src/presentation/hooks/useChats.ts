import { CreateChatParams } from "@/src/data/interfaces/chats.interface";
import { chatsRepository } from "@/src/data/repositories/chats.repository";
import { Chat } from "@/src/domain/entities/chat";
import { Message, MessageStatus } from "@/src/domain/entities/message";
import {
  chatData,
  createChat,
  messagesData,
  participantData,
  participantRows,
} from "@/src/domain/usecases/chats.usecase";
import { useCallback, useEffect, useState } from "react";

export function useChats({ currentUserId }: { currentUserId: string | null }) {
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    loadChats();
  }, [currentUserId, chats]);

  const loadChats = async () => {
    if (!currentUserId) {
      setSortedChats(() => []);
      setLoading(false);
      return;
    }

    try {
      const rowsParticipant = await participantRows(chatsRepository)({
        currentUserId,
      });

      const chatIds = rowsParticipant.map((row) => row.chatId);

      if (chatIds.length === 0) {
        setSortedChats(() => []);
        setLoading(false);
        return;
      }

      const loadedChats: Chat[] = [];

      for (const chatId of chatIds) {
        const dataChat = await chatData(chatsRepository)({ chatId });

        if (dataChat.length === 0) continue;

        const participantsData = await participantData(chatsRepository)({
          chatId,
        });

        const participantIds = participantsData.map((p) => p.userId);

        const dataMessages = await messagesData(chatsRepository)({ chatId });

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

      setSortedChats(() => loadedChats);
      
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const setSortedChats = (updater: (prevChats: Chat[]) => Chat[]) => {
    setChats((prevChats) => {
      const updated = updater(prevChats);
      return updated.sort((a, b) => {
        const aLast = a.messages[a.messages.length - 1];
        const bLast = b.messages[b.messages.length - 1];

        const aTime = aLast ? new Date(aLast.timestamp).getTime() : 0;
        const bTime = bLast ? new Date(bLast.timestamp).getTime() : 0;

        return bTime - aTime;
      });
    });
  };

  const createChatImpl = useCallback(
    async ({ chatId, participantIds }: CreateChatParams) => {
      if (!currentUserId || !participantIds.includes(currentUserId)) {
        return null;
      }

      try {
        await createChat(chatsRepository)({ chatId, participantIds });

        const newChat: Chat = {
          id: chatId,
          participants: participantIds,
          messages: [],
        };

        setSortedChats((prevChats) => [...prevChats, newChat]);
        return newChat;
      } catch (error) {
        console.error("Error creating chat:", error);
        return null;
      }
    },
    []
  );

  return {
    loading,
    chats,
    setSortedChats,
    createChat: createChatImpl,
  };
}

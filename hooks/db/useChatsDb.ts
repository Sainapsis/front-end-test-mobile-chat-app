import { useState, useEffect, useCallback } from 'react';
import { useDatabaseStatus } from '../../database/DatabaseProvider';
import { Chat, Media } from '@/interfaces/chatTypes';
import { ChatRepository } from '@/database/repositories/ChatRepository';
import { ChatError } from '@/interfaces/chatRepository';

export function useChatsDb(currentUserId: string | null) {
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { isInitialized } = useDatabaseStatus();
  const chatRepository = new ChatRepository();

  const handleError = (error: unknown, action: string) => {
    if (error instanceof ChatError) {
      console.error(`Error al ${action}: ${error.message}`);
    } else {
      console.error(`Error desconocido al ${action}:`, error);
    }
  };

  const loadChats = useCallback(async () => {
    if (!isInitialized || !currentUserId) {
      setUserChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const chats = await chatRepository.loadChats(currentUserId);
      setUserChats(chats);
    } catch (error) {
      handleError(error, 'cargar chats');
    } finally {
      setLoading(false);
    }
  }, [currentUserId, isInitialized]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const createChat = useCallback(async (participantIds: string[]) => {
    if (!currentUserId || !participantIds.includes(currentUserId)) return null;

    try {
      const newChat = await chatRepository.createChat(participantIds);
      if (newChat) setUserChats(prevChats => [...prevChats, newChat]);
      return newChat;
    } catch (error) {
      handleError(error, 'crear chat');
      return null;
    }
  }, [currentUserId]);

  const sendMessage = useCallback(async (chatId: string, text: string, senderId: string, media?: Media | null) => {
    try {
      const newMessage = await chatRepository.sendMessage(chatId, text, senderId, media);
      // Actualizar el estado inicial con el mensaje enviado
      setUserChats(prevChats => prevChats.map(chat => 
        chat.id === chatId ? 
        { ...chat, messages: [...chat.messages, newMessage], lastMessage: newMessage } 
        : chat
      ));

      // Simular el cambio de estado a delivered después de 1 segundo
      setTimeout(() => {
        setUserChats(prevChats => prevChats.map(chat => 
          chat.id === chatId ? {
            ...chat,
            messages: chat.messages.map(msg => 
              msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
            ),
            lastMessage: chat.lastMessage?.id === newMessage.id 
              ? { ...chat.lastMessage, status: 'delivered' } 
              : chat.lastMessage
          } : chat
        ));
      }, 1000);

      return true;
    } catch (error) {
      handleError(error, 'enviar mensaje');
      return false;
    }
  }, []);

  // Todo: fix this
  const markMessageAsRead = useCallback(async (messageId: string, userId: string) => {
    try {
      const success = await chatRepository.markMessageAsRead(messageId, userId);
      if (success) {
        setUserChats(prevChats => prevChats.map(chat => {
          const updatedMessages = chat.messages.map(msg => 
            msg.id === messageId ? { ...msg, status: 'read' as const, reads: [...(msg.reads || []), { userId, timestamp: Date.now() }] } : msg
          );
          return { ...chat, messages: updatedMessages, lastMessage: chat.lastMessage?.id === messageId ? { ...chat.lastMessage, status: 'read' } : chat.lastMessage };
        }));
      }
      return success;
    } catch (error) {
      handleError(error, 'marcar mensaje como leído');
      return false;
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string, chatId: string) => {
    try {
      const success = await chatRepository.deleteMessage(messageId, chatId);
      if (success) {
        setUserChats(prevChats => prevChats.map(chat => 
          chat.id === chatId ? { ...chat, messages: chat.messages.filter(msg => msg.id !== messageId), lastMessage: chat.messages.length > 1 ? chat.messages[chat.messages.length - 2] : undefined } : chat
        ));
      }
      return success;
    } catch (error) {
      handleError(error, 'eliminar mensaje');
      return false;
    }
  }, []);

  return {
    chats: userChats,
    createChat,
    sendMessage,
    markMessageAsRead,
    deleteMessage,
    loading: loading || !isInitialized,
  };
}
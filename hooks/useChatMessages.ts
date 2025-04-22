import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAppContext } from './AppContext';
import { Media } from '@/interfaces/chatTypes';

interface UseChatMessagesReturn {
  chat: any | undefined;
  currentUser: any | null;
  isSending: boolean;
  handleSendMessage: (text: string, media?: Media | null) => Promise<void>;
  handleDeleteMessage: (messageId: string) => Promise<void>;
}

export const useChatMessages = (chatId: string): UseChatMessagesReturn => {
  const { currentUser, chats, sendMessage, deleteMessage } = useAppContext();
  const [isSending, setIsSending] = useState(false);

  const chat = chats.find(c => c.id === chatId);

  const handleSendMessage = useCallback(async (text: string, media?: Media | null) => {
    if (!currentUser || !chat || (!text.trim() && !media)) return;

    setIsSending(true);

    try {
      const success = await sendMessage(chat.id, text.trim(), currentUser.id, media);

      if (!success) {
        throw new Error('Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSending(false);
    }
  }, [currentUser, chat, sendMessage]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!chat) return;

    try {
      const success = await deleteMessage(messageId, chat.id);
      if (!success) {
        Alert.alert('Error', 'No se pudo eliminar el mensaje');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      Alert.alert('Error', 'Ocurrió un error al eliminar el mensaje');
    }
  }, [chat, deleteMessage]);

  return {
    chat,
    currentUser,
    isSending,
    handleSendMessage,
    handleDeleteMessage,
  };
}; 
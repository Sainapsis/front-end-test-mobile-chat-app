import { useState, useEffect } from 'react';
import { useChatsDb } from './db/useChatsDb';

export const useMessageStatus = (chatId: string, currentUserId: string) => {
  const { updateMessageStatus, markMessagesAsRead } = useChatsDb(currentUserId);
  const [isLoading, setIsLoading] = useState(false);

  // Función para simular el envío de mensaje
  const simulateMessageSending = async (messageId: string) => {
    setIsLoading(true);
    
    // Simular delay de envío (2 segundos)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Actualizar estado a "enviado"
    await updateMessageStatus(messageId, 'sent');
    
    setIsLoading(false);
  };

  // Función para marcar mensajes como leídos
  const markAsRead = async () => {
    try {
      await markMessagesAsRead(chatId);
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
    }
  };

  // Efecto para marcar mensajes como leídos cuando el chat está visible
  useEffect(() => {
    markAsRead();
  }, [chatId]);

  return {
    simulateMessageSending,
    markAsRead,
    isLoading
  };
}; 
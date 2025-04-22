import { useEffect } from 'react';
import { useChatsDb, Chat, Message, MessageReaction } from './db/useChatsDb';
import { clearImageCache } from '@/components/OptimizedImage';

export { Chat, Message, MessageReaction };

export interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: number;
}

export function useChats(currentUser: User | null) {
  const {
    chats,
    createChat,
    sendMessage,
    markMessageAsRead,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    forwardMessage,
    loadMoreMessages,
    loading
  } = useChatsDb(currentUser?.id ?? null);

  // Limpiar caché de imágenes periódicamente para evitar problemas de memoria
  useEffect(() => {
    // Limpiar caché al inicio
    clearImageCache().catch(error =>
      console.error('Error al limpiar la caché de imágenes:', error)
    );

    // Programar limpieza periódica de caché (cada 24 horas)
    const cacheCleanInterval = setInterval(() => {
      clearImageCache().catch(error =>
        console.error('Error al limpiar la caché de imágenes:', error)
      );
    }, 24 * 60 * 60 * 1000);

    return () => {
      clearInterval(cacheCleanInterval);
    };
  }, []);

  return {
    chats,
    createChat,
    sendMessage,
    markMessageAsRead,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    forwardMessage,
    loadMoreMessages,
    loading,
    clearImageCache,
  };
} 
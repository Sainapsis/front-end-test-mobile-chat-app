import { useCallback } from 'react';
import { ViewToken } from 'react-native';
import { useAppContext } from './AppContext';

interface UseMessageStatusReturn {
  onViewableItemsChanged: (info: { viewableItems: ViewToken[] }) => void;
}

export const useMessageStatus = (): UseMessageStatusReturn => {
  const { currentUser, markMessageAsRead } = useAppContext();

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (!currentUser) return;
    
    viewableItems
      .filter(({ item, isViewable }) => (
        isViewable &&
        item.senderId !== currentUser.id &&
        item.status !== 'read'
      ))
      .forEach(async ({ item }) => {
        const success = await markMessageAsRead(item.id, currentUser.id);
        if (!success) {
          console.error('Error al marcar el mensaje como leído:', item.id);
        }
      });
  }, [currentUser, markMessageAsRead]);

  return {
    onViewableItemsChanged,
  };
}; 
import { useRef, useCallback } from 'react';
import { FlatList } from 'react-native';

export const useChatScroll = () => {
  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, []);

  return {
    flatListRef,
    scrollToBottom,
  };
}; 
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

/**
 * Custom hook for managing loading state during navigation transitions
 * @returns Object containing the current loading state
 */
export function useLoadingState() {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setIsLoading(true);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      setIsLoading(false);
    });

    return unsubscribe;
  }, [navigation]);

  return { isLoading };
}
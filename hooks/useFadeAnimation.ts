import { useRef } from 'react';
import { Animated } from 'react-native';

export const useFadeAnimation = (initialValue: number = 1) => {
  const fadeAnim = useRef(new Animated.Value(initialValue)).current;

  const fadeOut = (callback?: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(callback);
  };

  return { fadeAnim, fadeOut };
}; 
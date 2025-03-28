import { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';

interface Position {
  top: number;
  left: number;
  width: number;
}

export const useOptionsMenu = (visible: boolean, position?: Position) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const getAdjustedPosition = () => {
    if (!position) return null;

    const screenWidth = Dimensions.get('window').width;
    const menuWidth = 220;
    const padding = 10;

    return {
      left: Math.min(position.left, screenWidth - menuWidth - padding),
      top: position.top + 10,
      opacity: fadeAnim,
    };
  };

  return {
    fadeAnim,
    getAdjustedPosition,
  };
};
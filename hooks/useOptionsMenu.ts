import { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';

interface Position {
  top: number;
  left: number;
  width: number;
}

/**
 * Custom hook for managing options menu animations and positioning
 * @param visible - Boolean indicating if the menu is visible
 * @param position - Optional position object for menu placement
 * @returns Object containing animation value and position calculator
 */
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

  /**
   * Calculates adjusted position for the menu based on screen dimensions
   * @returns Object containing adjusted position and opacity
   */
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
import { Animated } from 'react-native';

/**
 * transitions object provides various animation transitions for UI elements.
 * Includes scale, opacity, and slide animations for interactive components.
 */
export const transitions = {
  /**
   * Scale animations for pressed and released states
   */
  scale: {
    pressed: (scale: Animated.Value) =>
      Animated.spring(scale, {
        toValue: 0.98,
        useNativeDriver: true,
      }),
    released: (scale: Animated.Value) =>
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
  },
  /**
   * Opacity animations for pressed and released states
   */
  opacity: {
    pressed: (opacity: Animated.Value) =>
      Animated.timing(opacity, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    released: (opacity: Animated.Value) =>
      Animated.timing(opacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
  },
  /**
   * Slide in animation
   * @param translateY - Animated value for Y-axis translation
   */
  slideIn: (translateY: Animated.Value) =>
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }),
  /**
   * Slide out animation
   * @param translateY - Animated value for Y-axis translation
   * @param distance - Distance to slide out
   */
  slideOut: (translateY: Animated.Value, distance: number) =>
    Animated.spring(translateY, {
      toValue: distance,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }),
};
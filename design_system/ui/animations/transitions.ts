import { Animated } from 'react-native';

export const transitions = {
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
  slideIn: (translateY: Animated.Value) =>
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }),
  slideOut: (translateY: Animated.Value, distance: number) =>
    Animated.spring(translateY, {
      toValue: distance,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }),
};
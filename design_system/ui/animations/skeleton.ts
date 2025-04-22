import { Animated } from 'react-native';

/**
 * skeletonAnimation object provides animations for skeleton loading effects.
 * It includes a pulse animation that can be used for loading states.
 */
export const skeletonAnimation = {
  /**
   * Creates a pulsing animation for skeleton loading
   * @param opacity - Animated value to control the opacity
   * @returns Animated loop sequence
   */
  pulse: (opacity: Animated.Value) => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    return animation;
  },
};
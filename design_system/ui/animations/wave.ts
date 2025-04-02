import { withTiming, withRepeat, withSequence } from 'react-native-reanimated';

/**
 * waveAnimation object provides animations for wave-like effects.
 * It includes rotation animations and style transformations.
 */
export const waveAnimation = {
  /**
   * Creates a wave-like rotation animation
   * @param rotationAnimation - Object containing the animated value
   */
  rotate: (rotationAnimation: { value: number }) => {
    rotationAnimation.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 150 }), 
        withTiming(0, { duration: 150 })
      ),
      4
    );
  },
  /**
   * Generates style object for wave animation
   * @param rotationAnimation - Object containing the animated value
   * @returns Style object with rotation transformation
   */
  style: (rotationAnimation: { value: number }) => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }],
  }),
};
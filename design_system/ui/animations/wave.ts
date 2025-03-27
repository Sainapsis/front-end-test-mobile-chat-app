import { withTiming, withRepeat, withSequence } from 'react-native-reanimated';

export const waveAnimation = {
  rotate: (rotationAnimation: { value: number }) => {
    rotationAnimation.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 150 }), 
        withTiming(0, { duration: 150 })
      ),
      4
    );
  },
  style: (rotationAnimation: { value: number }) => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }],
  }),
};
import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { waveAnimation } from '@/design_system/ui/animations';

/**
 * Custom hook for handling wave animation
 * @returns Animated style object for wave effect
 */
export function useHelloWaveAnimation() {
  const rotationAnimation = useSharedValue(0);

  useEffect(() => {
    waveAnimation.rotate(rotationAnimation);
  }, []);

  const animatedStyle = useAnimatedStyle(() => 
    waveAnimation.style(rotationAnimation)
  );

  return animatedStyle;
}
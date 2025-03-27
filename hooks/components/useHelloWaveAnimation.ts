import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { waveAnimation } from '@/design_system/ui/animations';

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
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { skeletonAnimation } from '@/design_system/ui/animations';

/**
 * Custom hook for handling skeleton loader animations
 * @returns Animated value for opacity to be used in skeleton loading components
 */
export function useSkeletonLoader() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = skeletonAnimation.pulse(opacity);
    animation.start();

    return () => animation.stop();
  }, []);

  return opacity;
}
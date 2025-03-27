import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { skeletonAnimation } from '@/design_system/ui/animations';
import { styles } from './SkeletonLoader.styles';

interface SkeletonLoaderProps {
  width: number | string;
  height: number;
  style?: any;
}

export function SkeletonLoader({ width, height, style }: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = skeletonAnimation.pulse(opacity);
    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, opacity },
        style,
      ]}
    />
  );
}
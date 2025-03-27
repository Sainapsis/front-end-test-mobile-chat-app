import React from 'react';
import { Animated } from 'react-native';
import { styles } from './SkeletonLoader.styles';
import { useSkeletonLoader } from '@/hooks/components/useSkeletonLoader';

interface SkeletonLoaderProps {
  width: number | string;
  height: number;
  style?: any;
}

export function SkeletonLoader({ width, height, style }: SkeletonLoaderProps) {
  const opacity = useSkeletonLoader(); 

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
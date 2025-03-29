import React from 'react';
import { Animated } from 'react-native';
import { styles } from './SkeletonLoader.styles';
import { useSkeletonLoader } from '@/hooks/components/useSkeletonLoader';

interface SkeletonLoaderProps {
  /** Width of the skeleton loader */
  width: number | string;
  /** Height of the skeleton loader */
  height: number;
  /** Custom styles to be applied to the skeleton loader */
  style?: any;
}

/**
 * SkeletonLoader component is used to display a placeholder while content is loading.
 * It provides a smooth animation to indicate loading state.
 */
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
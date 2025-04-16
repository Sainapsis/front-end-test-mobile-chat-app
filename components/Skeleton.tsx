import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  style?: any;
  borderRadius?: number;
}

export function Skeleton({ width = '100%', height = 20, style, borderRadius = 4 }: SkeletonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View
      style={[
        styles.skeleton,
        { width, height, borderRadius, backgroundColor: colors.border },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
}); 
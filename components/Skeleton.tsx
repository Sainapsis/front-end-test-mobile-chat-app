/**
 * Skeleton Component
 * 
 * A loading placeholder component that displays a shimmering effect to indicate content is loading.
 * This component is commonly used to improve perceived performance by showing a visual representation
 * of content before it's actually loaded.
 * 
 * Features:
 * - Customizable dimensions (width and height)
 * - Adjustable border radius
 * - Theme-aware background color
 * - Support for additional custom styles
 * - Overflow handling
 */

import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

/**
 * Props interface for the Skeleton component
 * 
 * @property width - Width of the skeleton (number or string with units)
 * @property height - Height of the skeleton (number or string with units)
 * @property style - Additional custom styles to apply
 * @property borderRadius - Border radius of the skeleton
 */
interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  style?: any;
  borderRadius?: number;
}

/**
 * Skeleton Component Implementation
 * 
 * Renders a loading placeholder with the following features:
 * - Uses theme-aware background color
 * - Supports flexible dimensions
 * - Applies custom border radius
 * - Handles overflow properly
 * - Allows for additional custom styling
 */
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

/**
 * Component styles
 * 
 * Defines the base styling for the skeleton:
 * - Handles overflow to ensure proper rendering
 * - Base styles that can be extended with props
 */
const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
}); 
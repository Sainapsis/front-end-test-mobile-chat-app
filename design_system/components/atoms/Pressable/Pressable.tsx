import React from 'react';
import { Pressable as RNPressable, Animated, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import { useAnimatedPressable } from '@/hooks/components/useAnimatedPressable'; // Importa el hook desde la nueva ubicación

interface AnimatedPressableProps {
  /** Content to be rendered inside the pressable component */
  children: React.ReactNode;
  /** Function to be called when the component is pressed */
  onPress?: () => void;
  /** Function to be called when the component is long-pressed */
  onLongPress?: () => void;
  /** Custom styles to be applied to the component */
  style?: StyleProp<ViewStyle>;
  /** If true, the component is disabled and cannot be interacted with */
  disabled?: boolean;
}

/**
 * AnimatedPressable component enhances the default Pressable with animations.
 * It provides scale and opacity animations on press interactions.
 */
export function AnimatedPressable({
  children,
  onPress,
  onLongPress,
  style,
  disabled,
}: AnimatedPressableProps) {
  const { scaleAnim, opacityAnim, handlePressIn, handlePressOut } = useAnimatedPressable();

  return (
    <RNPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          style as ViewStyle, // Forzamos ViewStyle para evitar conflictos
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {children}
      </Animated.View>
    </RNPressable>
  );
}

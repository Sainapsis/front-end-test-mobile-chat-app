import React from 'react';
import { Pressable as RNPressable, Animated, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import { useAnimatedPressable } from '@/hooks/components/useAnimatedPressable'; // Importa el hook desde la nueva ubicación

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

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

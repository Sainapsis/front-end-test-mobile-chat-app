import React, { useRef } from 'react';
import { Pressable as RNPressable, Animated, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import { transitions } from '@/design_system/ui/animations/transitions';

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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      transitions.scale.pressed(scaleAnim),
      transitions.opacity.pressed(opacityAnim),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      transitions.scale.released(scaleAnim),
      transitions.opacity.released(opacityAnim),
    ]).start();
  };

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

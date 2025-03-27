import { useRef } from 'react';
import { Animated } from 'react-native';
import { transitions } from '@/design_system/ui/animations/transitions';

export function useAnimatedPressable() {
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

  return { scaleAnim, opacityAnim, handlePressIn, handlePressOut };
}
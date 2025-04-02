import { useRef } from 'react';
import { Animated } from 'react-native';
import { transitions } from '@/design_system/ui/animations/transitions';

/**
 * Custom hook for handling press animations on components.
 * Provides scale and opacity animations for pressable elements.
 * @returns {Object} An object containing animation values and press handlers
 */
export function useAnimatedPressable() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  /**
   * Handles press in event with animations
   */
  const handlePressIn = () => {
    Animated.parallel([
      transitions.scale.pressed(scaleAnim),
      transitions.opacity.pressed(opacityAnim),
    ]).start();
  };

  /**
   * Handles press out event with animations
   */
  const handlePressOut = () => {
    Animated.parallel([
      transitions.scale.released(scaleAnim),
      transitions.opacity.released(opacityAnim),
    ]).start();
  };

  return { scaleAnim, opacityAnim, handlePressIn, handlePressOut };
}
import { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { ThemedText } from '@/design_system/components/atoms';
import { waveAnimation } from '@/design_system/ui/animations';
import { styles } from './HelloWave.styles';

export function HelloWave() {
  const rotationAnimation = useSharedValue(0);

  useEffect(() => {
    waveAnimation.rotate(rotationAnimation);
  }, []);

  const animatedStyle = useAnimatedStyle(() => 
    waveAnimation.style(rotationAnimation)
  );

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.text}>👋</ThemedText>
    </Animated.View>
  );
}

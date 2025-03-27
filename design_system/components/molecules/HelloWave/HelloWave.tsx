import Animated from 'react-native-reanimated';
import { ThemedText } from '@/design_system/components/atoms';
import { styles } from './HelloWave.styles';
import { useHelloWaveAnimation } from '@/hooks/components/useHelloWaveAnimation';

export function HelloWave() {
  const animatedStyle = useHelloWaveAnimation(); 

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.text}>👋</ThemedText>
    </Animated.View>
  );
}

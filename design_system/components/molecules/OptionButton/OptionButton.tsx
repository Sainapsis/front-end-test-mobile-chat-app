import React from 'react';
import { Pressable, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './OptionButton.styles';
import { themes } from '@/design_system/ui/tokens';
import { useColorScheme } from '@/hooks/useColorScheme';

interface OptionButtonProps {
  icon: string;
  text: string;
  onPress: () => void;
  color?: string;
}

export const OptionButton: React.FC<OptionButtonProps> = ({ icon, text, onPress, color = 'black'}) => {
  const theme = useColorScheme() ?? 'light';
  return (
    <Pressable style={styles.optionButton} onPress={onPress} android_ripple={{ color: '#ddd', borderless: false }}>
      <Ionicons name={icon} size={20} color={ theme === 'light' ? themes.light.text.contrast : themes.dark.text.contrast } />
      <Text style={[styles.optionText, { color }]}>{text}</Text>
    </Pressable>
  );
}

export default OptionButton;
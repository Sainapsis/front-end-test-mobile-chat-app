import React from 'react';
import { Pressable, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './OptionButton.styles';

interface OptionButtonProps {
  icon: string;
  text: string;
  onPress: () => void;
  color?: string;
}

export const OptionButton: React.FC<OptionButtonProps> = ({ icon, text, onPress, color = 'black' }) => (
  <Pressable style={styles.optionButton} onPress={onPress} android_ripple={{ color: '#ddd', borderless: false }}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={[styles.optionText, { color }]}>{text}</Text>
  </Pressable>
);

export default OptionButton;
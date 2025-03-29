import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms';
import { styles } from './ErrorMessage.styles';

interface ErrorMessageProps {
  /** Error message to be displayed */
  message: string;
}

/**
 * ErrorMessage component is used to display error messages to the user.
 * It provides a consistent way to show error information across the application.
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <View style={styles.container}>
    <ThemedText style={styles.text}>{message}</ThemedText>
  </View>
);
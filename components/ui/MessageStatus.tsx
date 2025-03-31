// Nuevo archivo: components/MessageStatus.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { useTheme } from '@/hooks/theme/useTheme';


interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'read';
  isOwnMessage: boolean;
}

export function MessageStatus({ status, isOwnMessage }: MessageStatusProps) {
  const { colors,isDark } = useTheme();

  if (!isOwnMessage) return null;

  return (
    <View style={styles.container}>
      {status === 'sent' && (
        <IconSymbol 
          name="checkmark" 
          size={12} 
          color={ "white"} 
        />
      )}
      {status === 'delivered' && (
        <IconSymbol 
          name="checkmark.circle" 
          size={12} 
          color={"white"} 
        />
      )}
      {status === 'read' && (
        <IconSymbol 
          name="checkmark.circle.fill" 
          size={12} 
          color={"green"} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    alignSelf: 'flex-end',
  },
});
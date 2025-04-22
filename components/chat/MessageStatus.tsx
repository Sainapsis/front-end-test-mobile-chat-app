import React from 'react';
import { View} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Message } from '@/interfaces/chatTypes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { messageStatusStyles } from '@/styles/components/messageStatus.styles';

interface MessageStatusProps {
  message: Message;
}

export function MessageStatus({ message }: MessageStatusProps) {
  const isDark = useColorScheme() === 'dark';
  const color = message.status === 'read' ? '#0a7ea4' : (isDark ? '#8E8E93' : '#8F8F8F');

  return (
    <View style={messageStatusStyles.container}>
      {message.status === 'sent' ? (
        <IconSymbol
          name="checkmark"
          size={12}
          color={color}
        />
      ) : (
        <View style={messageStatusStyles.doubleCheckContainer}>
          <IconSymbol
            name="checkmark"
            size={14}
            color={color}
            style={messageStatusStyles.firstCheck}
          />
          <IconSymbol
            name="checkmark"
            size={14}
            color={color}
            style={messageStatusStyles.secondCheck}
          />
        </View>
      )}
    </View>
  );
}


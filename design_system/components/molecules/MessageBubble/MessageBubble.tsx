import React from 'react';
import { View, Alert, TouchableWithoutFeedback } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms';
import { Message } from '@/hooks/useChats';
import { useColorScheme } from '@/hooks/useColorScheme';
import { styles, getBubbleColors } from './MessageBubble.styles';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onDeleteMessage?: (messageId: string) => void;
}

export function MessageBubble({ message, isCurrentUser, onDeleteMessage }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bubbleColors = getBubbleColors(isDark, isCurrentUser);

  const handleLongPress = () => {
    if (isCurrentUser && onDeleteMessage) {
      Alert.alert(
        'Delete Message',
        'Do you want to delete this message?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', onPress: () => onDeleteMessage(message.id), style: 'destructive' }
        ]
      );
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableWithoutFeedback onLongPress={handleLongPress}>
      <View style={[styles.container, isCurrentUser ? styles.selfContainer : styles.otherContainer]}>
        <View style={[
          styles.bubble,
          isCurrentUser ? styles.selfBubble : styles.otherBubble,
          { backgroundColor: bubbleColors.background }
        ]}>
          <ThemedText style={[styles.messageText, isCurrentUser && !isDark && styles.selfMessageText]}>
            {message.text}
          </ThemedText>
          <View style={styles.timeContainer}>
            <ThemedText style={styles.timeText}>
              {formatTime(message.timestamp)}
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

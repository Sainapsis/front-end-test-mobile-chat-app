import React from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms';
import { styles } from './MessageBubble.styles';
import { useMessageBubble } from '@/hooks/components/useMessageBubble'; // Import the custom hook
import { Message } from '@/hooks/useChats';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onDeleteMessage?: (messageId: string) => void;
}

export function MessageBubble({ message, isCurrentUser, onDeleteMessage }: MessageBubbleProps) {
  const { isDark, bubbleColors, handleLongPress } = useMessageBubble({ message, isCurrentUser, onDeleteMessage });

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

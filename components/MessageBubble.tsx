import React from 'react';
import { View, StyleSheet, Alert, TouchableWithoutFeedback } from 'react-native';
import { ThemedText } from './ThemedText';
import { Message } from '@/hooks/useChats';
import { useColorScheme } from '@/hooks/useColorScheme';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onDeleteMessage?: (messageId: string) => void;
}

export function MessageBubble({ message, isCurrentUser, onDeleteMessage }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
          isCurrentUser
            ? [styles.selfBubble, { backgroundColor: isDark ? '#235A4A' : '#DCF8C6' }]
            : [styles.otherBubble, { backgroundColor: isDark ? '#2A2C33' : '#FFFFFF' }]
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

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  selfContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  selfBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  selfMessageText: {
    color: '#000000',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.7,
  },
});

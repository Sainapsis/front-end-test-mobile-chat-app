import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { Message } from '@/hooks/useChats';
import { useColorScheme } from '@/hooks/useColorScheme';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.chatContainer}>
      <View style={styles.timeContainer}>
        <ThemedText style={[styles.timeText, isCurrentUser
          ? [styles.selfContainer]
          : [styles.otherContainer]]}>
          {formatTime(message.timestamp)}
        </ThemedText>
      </View>
      <View style={[
        styles.container,
        isCurrentUser ? styles.selfContainer : styles.otherContainer
      ]}>
        <View style={[
          styles.bubble,
          isCurrentUser
            ? [styles.selfBubble, { backgroundColor: isDark ? '#235A4A' : '#DCF8C6' }]
            : [styles.otherBubble, { backgroundColor: isDark ? '#2A2C33' : '#FFFFFF' }]
        ]}>
          <ThemedText style={[
            styles.messageText,
            isCurrentUser && !isDark && styles.selfMessageText
          ]}>
            {message.text}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    marginBottom: 10,
  },
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
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1
  },
  selfBubble: {
  },
  otherBubble: {
  },
  messageText: {
    fontSize: 16,
  },
  selfMessageText: {
    color: '#000000',
  },
  timeContainer: {
    flexDirection: 'column',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.7,
    lineHeight: 11,
  },
}); 
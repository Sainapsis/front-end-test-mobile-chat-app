import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { Message } from '@/hooks/useChats';
import { useColorScheme } from '@/hooks/useColorScheme';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

function MessageBubbleComponent({ message, isCurrentUser }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formattedTime = useMemo(() => {
    const date = new Date(message.timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [message.timestamp]);

  const bubbleStyle = useMemo(() => [
    styles.bubble,
    isCurrentUser
      ? [styles.selfBubble, { backgroundColor: isDark ? '#235A4A' : '#DCF8C6' }]
      : [styles.otherBubble, { backgroundColor: isDark ? '#2A2C33' : '#FFFFFF' }]
  ], [isCurrentUser, isDark]);

  const messageTextStyle = useMemo(() => [
    styles.messageText,
    isCurrentUser && !isDark && styles.selfMessageText
  ], [isCurrentUser, isDark]);

  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.selfContainer : styles.otherContainer
    ]}>
      <View style={bubbleStyle}>
        <ThemedText style={messageTextStyle}>
          {message.text}
        </ThemedText>
        <View style={styles.timeContainer}>
          <ThemedText style={styles.timeText}>
            {formattedTime}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

export const MessageBubble = React.memo(MessageBubbleComponent, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.timestamp === nextProps.message.timestamp &&
    prevProps.message.text === nextProps.message.text &&
    prevProps.isCurrentUser === nextProps.isCurrentUser
  );
});

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
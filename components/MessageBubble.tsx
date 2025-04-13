import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { Message } from '@/hooks/useChats';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol, IconSymbolName } from './ui/IconSymbol';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const bubbleColor = useThemeColor({}, isCurrentUser ? 'selfBubble' : 'otherBubble');
  const bubbleTextColor = useThemeColor({}, 'bubbleText');
  const iconThemeColor = useThemeColor({}, 'icon');

  const getStatusIcon = () => {
    if (!isCurrentUser) return null;
    
    let iconName: IconSymbolName = 'checkmark';
    let iconColor = iconThemeColor;
    
    if (message.status === 'delivered') {
      iconName = 'checkmark.diamond';
    } else if (message.status === 'read') {
      iconName = 'eye.fill';
    }
    return (
      <IconSymbol
        name={iconName}
        size={12}
        color={iconColor}
        style={{ marginLeft: 4 }}
      />
    );
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.selfContainer : styles.otherContainer
    ]}>
      <View style={[
        styles.bubble,
        isCurrentUser ? styles.selfBubble : styles.otherBubble,
        { backgroundColor: bubbleColor }
      ]}>
        <ThemedText style={[
          styles.messageText,
          { color: bubbleTextColor }
        ]}>
          {message.text}
        </ThemedText>
        <View style={styles.timeContainer}>
          <ThemedText style={styles.timeText}>
            {formatTime(message.timestamp)}
          </ThemedText>
          {getStatusIcon()}
        </View>
      </View>
    </View>
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
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.7,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  statusIcon: {
    marginLeft: 2,
  },
}); 
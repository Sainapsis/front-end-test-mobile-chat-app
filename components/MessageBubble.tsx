import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { ThemedText } from './ThemedText';
import { Message } from '@/hooks/useChats';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from './ui/IconSymbol';

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
  const getDeliveryStatusIcon = () => {
    if (!isCurrentUser) return null;

    if (message.is_read) {
      return (
        <View style={styles.doubleCheck}>
          <IconSymbol name="checkmark" size={12} color="#34C759" />
          <IconSymbol name="checkmark" size={12} color="#34C759" />
        </View>
      );
    }
    
    switch (message.delivery_status) {
      case 'sending':
        return <IconSymbol name="clock" size={12} color={isDark ? '#8F8F8F' : '#666666'} />;
      case 'sent':
        return <IconSymbol name="checkmark" size={12} color={isDark ? '#8F8F8F' : '#666666'} />;
      case 'delivered':
        return (
          <View style={styles.doubleCheck}>
            <IconSymbol name="checkmark" size={12} color={isDark ? '#8F8F8F' : '#666666'} />
            <IconSymbol name="checkmark" size={12} color={isDark ? '#8F8F8F' : '#666666'} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
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
        {message.imageUrl && (
          <Image 
            source={{ uri: message.imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
        )}
        {message.text && (
          <ThemedText style={[
            styles.messageText,
            isCurrentUser && !isDark && styles.selfMessageText
          ]}>
            {message.text}
          </ThemedText>
        )}
        <View style={styles.timeContainer}>
          <ThemedText style={styles.timeText}>
            {formatTime(message.timestamp)}
          </ThemedText>
          {isCurrentUser && (
            <View style={styles.statusContainer}>
              {getDeliveryStatusIcon()}
            </View>
          )}
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
    shadowRadius: 1,
  },
  selfBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
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
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.7,
    marginRight: 4,
  },
  statusContainer: {
    marginLeft: 4,
  },
  doubleCheck: {
    flexDirection: 'row',
    gap: 2,
  },
}); 
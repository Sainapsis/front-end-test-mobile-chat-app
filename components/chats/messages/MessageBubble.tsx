import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { Message } from '@/hooks/chats/useChats';
import { useColorScheme } from '@/hooks/themes/useColorScheme';
import { Avatar } from '@/components/ui/user/Avatar';
import { User } from '@/hooks/user/useUser';
import { IconSymbol } from '@/components/ui/icons/IconSymbol';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  isReaded: boolean;
}

export function MessageBubble({ message, isCurrentUser, isReaded }: MessageBubbleProps) {
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
          : [styles.otherContainer, styles.otherText]]}>
          {isCurrentUser ? '' : message.senderName + ' '}{formatTime(message.timestamp)}
          {message.readed ?
            <IconSymbol name="checkmark" color="#808080" size={16}></IconSymbol> : <></>
          }
        </ThemedText>
      </View>
      <View style={[
        styles.container,
        isCurrentUser ? styles.selfContainer : styles.otherContainer
      ]}>
        <View style={styles.bubbleContainer}>
          <View style={styles.avatar}>
            {isCurrentUser ? <></> : <Avatar userName={message.senderName} size={30} status={"online"}></Avatar>}
          </View>
          <View style={[
            styles.bubble,
            isCurrentUser
              ? [styles.selfBubble, { backgroundColor: isDark ? '#1E1E1E' : '#EEF6FF' }]
              : [styles.otherBubble, { backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF' }]
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
  otherText: {
    marginLeft: 45,
  },
  bubble: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 1,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1
  },
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    alignItems: 'center',
  },
  avatar: {
    marginRight: 5
  }
}); 
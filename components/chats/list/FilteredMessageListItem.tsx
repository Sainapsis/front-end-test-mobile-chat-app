import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Message } from '@/hooks/chats/useChats';
import { ThemedText } from '../../ui/text/ThemedText';
import { useAppContext } from '@/hooks/AppContext';
import { IconSymbol } from '@/components/ui/icons/IconSymbol';
import { useColorScheme } from '@/hooks/themes/useColorScheme.web';
import { Colors } from '@/components/ui/themes/Colors';

interface ChatListItemProps {
  message: Message;
  currentUserId: string;
}

export function FilteredMessageListItem({ message, currentUserId }: ChatListItemProps) {
  const navigation = useNavigation();
  const { updateReadStatus, setMessageId } = useAppContext()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const handlePress = () => {
    updateReadStatus(currentUserId, message.chatId)
    setMessageId(message.id)
    navigation.navigate('chat-room' as never, { chatId: message.chatId } as never);
  };

  const timeString = useMemo(() => {
    if (!message.timestamp) return '';

    const date = new Date(message.timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }, [message.timestamp]);

  const isCurrentUserSender = currentUserId === message.senderId;

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.name}>
            {message.senderName}
          </ThemedText>
          {timeString && (
            <ThemedText style={styles.time}>{timeString}</ThemedText>
          )}
        </View>
        <View style={styles.bottomRow}>
          {message.timestamp && (
            <ThemedText
              numberOfLines={1}
              style={[
                styles.lastMessage,
                isCurrentUserSender && styles.currentUserMessage
              ]}
            >
              {isCurrentUserSender ? 'You: ' : `${message.senderName}: `}{message.text}
            </ThemedText>
          )}
          <IconSymbol name='chevron.right' size={8} color={isDark ? Colors.light.badges.secondary : Colors.badges.primary}></IconSymbol>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  unreadedBadgeContainer: {
    height: 18,
  },
  unreadedBadgeText: {
    fontSize: 10,
    lineHeight: 20
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#8F8F8F',
    marginRight: 15,
  },
  lastMessage: {
    fontSize: 14,
    color: '#8F8F8F',
    flex: 1,
    paddingRight: 5
  },
  currentUserMessage: {
  },
}); 
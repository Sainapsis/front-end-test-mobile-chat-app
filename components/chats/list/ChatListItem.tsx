import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Chat } from '@/hooks/chats/useChats';
import { Avatar } from '@/components/ui/user/Avatar';
import { ThemedText } from '../../ui/text/ThemedText';
import { User } from '@/hooks/user/useUser';
import { useAppContext } from '@/hooks/AppContext';
import { users } from '@/providers/database/schema';
import { ThemedBadge } from '@/components/ui/badges/ThemedBadge';

interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
  users: User[];
}

export function ChatListItem({ chat, currentUserId }: ChatListItemProps) {
  const navigation = useNavigation();
  const { updateReadStatus } = useAppContext()

  const handlePress = () => {
    updateReadStatus(currentUserId, chat.id)
    navigation.navigate('chat-room' as never, { chatId: chat.id } as never);
  };

  const timeString = useMemo(() => {
    if (!chat.lastMessage) return '';

    const date = new Date(chat.lastMessageTime);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    console.log(diffInDays)
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }, [chat.lastMessage]);

  const isCurrentUserLastSender = currentUserId === chat.lastMessageSenderId;
  console.log(isCurrentUserLastSender, currentUserId, chat.lastMessageSenderId )

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Avatar
        userName={chat.chatName}
        size={50}
        status={chat.chatStatus as "online" | "offline" | "away"}
      />
      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.name}>
            {chat.chatName}
          </ThemedText>
          {timeString && (
            <ThemedText style={styles.time}>{timeString}</ThemedText>
          )}
        </View>
        <View style={styles.bottomRow}>
          {chat.lastMessage && (
            <ThemedText
              numberOfLines={1}
              style={[
                styles.lastMessage,
                isCurrentUserLastSender && styles.currentUserMessage
              ]}
            >
              {isCurrentUserLastSender && 'You: '}{chat.lastMessage}
            </ThemedText>
          )}
          {chat.unreadedMessages > 0 ? <ThemedBadge text={chat.unreadedMessages.toString()} type="primary" style={styles.unreadedBadgeContainer} textStyle={styles.unreadedBadgeText}></ThemedBadge> : <></>}

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
  unreadedBadgeContainer:{
    height: 18,
  },
  unreadedBadgeText:{
    fontSize: 10,
    lineHeight: 20
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
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
  },
  lastMessage: {
    fontSize: 14,
    color: '#8F8F8F',
    flex: 1,
  },
  currentUserMessage: {
  },
}); 
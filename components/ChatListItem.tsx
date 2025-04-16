import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Chat } from '@/hooks/useChats';
import { Avatar } from './Avatar';
import { ThemedText } from './ThemedText';
import { User } from '@/hooks/useUser';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
  users: User[];
  selectedChats: string[];
  onSelect: (chatId: string, isSelected: boolean) => void;
}

export function ChatListItem({
  chat,
  currentUserId,
  users,
  selectedChats,
  onSelect
}: ChatListItemProps) {
  const navigation: any = useNavigation();
  const colorScheme = useColorScheme() ?? 'light';

  const otherParticipants = useMemo(() => {
    return chat.participants
      .filter(id => id !== currentUserId)
      .map(id => users.find(user => user.id === id))
      .filter(Boolean) as User[];
  }, [chat.participants, currentUserId, users]);

  const chatName = useMemo(() => {
    if (chat.isGroup) {
      return chat.groupName || 'Group Chat';
    }
    if (otherParticipants.length === 0) {
      return 'No participants';
    } else if (otherParticipants.length === 1) {
      return otherParticipants[0].name;
    } else {
      return `${otherParticipants[0].name} & ${otherParticipants.length - 1} other${otherParticipants.length > 2 ? 's' : ''}`;
    }
  }, [otherParticipants, chat.isGroup, chat.groupName]);

  const unreadCount = useMemo(() => {
    return chat.messages.filter(message =>
      message.senderId !== currentUserId &&
      (message.delivery_status !== 'read' || !message.is_read)
    ).length;
  }, [chat.messages, currentUserId]);

  const handlePress = useCallback(() => {
    if (selectedChats.length > 0 || selectedChats.includes(chat.id)) {
      onSelect(chat.id, !selectedChats.includes(chat.id));
    } else {
      navigation.navigate('ChatRoom' as never, { chatId: chat.id } as never);
    }
  }, [chat.id, navigation, selectedChats, onSelect]);

  const handleLongPress = useCallback(() => {
    onSelect(chat.id, !selectedChats.includes(chat.id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [chat.id, selectedChats, onSelect]);

  const timeString = useMemo(() => {
    if (!chat.lastMessage) return '';

    const date = new Date(chat.lastMessage.timestamp);
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
  }, [chat.lastMessage]);

  const isCurrentUserLastSender = chat.lastMessage?.senderId === currentUserId;
  const isSelected = selectedChats.includes(chat.id);

  return (
    <Pressable
      style={[
        styles.container,
        isSelected && styles.selectedContainer
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
    >
      <Avatar
        user={otherParticipants[0]}
        size={50}
        isGroup={chat.isGroup}
      />
      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.name}>
            {chatName}
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
              {isCurrentUserLastSender && 'You: '}
              {chat.messages[chat.messages.length - 1]?.voiceUrl && (
                <><IconSymbol name="mic" size={16} color={Colors[colorScheme].icon} />{"Audio..."}</>
              )}
              {chat.messages[chat.messages.length - 1]?.imageUrl && (
                <><IconSymbol name="photo" size={16} color={Colors[colorScheme].icon} />{" "}</>
              )}
              {chat.lastMessage.text}
            </ThemedText>
          )}
          { unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: Colors.light.tint }]}>
              <ThemedText style={styles.unreadCount}>{unreadCount}</ThemedText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E1E1E1',
  },
  selectModeContainer: {
    paddingLeft: 8,
  },
  selectedContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  checkboxContainer: {
    marginRight: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontStyle: 'italic',
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 18,
    textAlign: 'center',
  },
}); 
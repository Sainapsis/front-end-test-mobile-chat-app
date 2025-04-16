/**
 * ChatListItem Component
 * 
 * A component that displays a single chat item in the chat list with the following features:
 * - Shows chat name (individual or group)
 * - Displays last message preview
 * - Shows timestamp of last message
 * - Indicates unread message count
 * - Supports selection for bulk actions
 * - Handles navigation to chat room
 * - Shows message type indicators (text, image, voice)
 * - Handles deleted messages
 */

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

/**
 * Props interface for the ChatListItem component
 * 
 * @property chat - Chat object containing chat information
 * @property currentUserId - ID of the current user
 * @property users - Array of all users in the system
 * @property selectedChats - Array of currently selected chat IDs
 * @property onSelect - Callback function for chat selection
 */
interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
  users: User[];
  selectedChats: string[];
  onSelect: (chatId: string, isSelected: boolean) => void;
}

/**
 * ChatListItem Component Implementation
 * 
 * Renders a single chat item with the following features:
 * - Avatar display (individual or group)
 * - Chat name and last message preview
 * - Timestamp formatting
 * - Unread message count
 * - Selection state handling
 * - Navigation to chat room
 */
export function ChatListItem({
  chat,
  currentUserId,
  users,
  selectedChats,
  onSelect
}: ChatListItemProps) {
  const navigation: any = useNavigation();
  const colorScheme = useColorScheme() ?? 'light';

  /**
   * Filters and maps participants to get other users in the chat
   * Excludes the current user from the list
   */
  const otherParticipants = useMemo(() => {
    return chat.participants
      .filter(id => id !== currentUserId)
      .map(id => users.find(user => user.id === id))
      .filter(Boolean) as User[];
  }, [chat.participants, currentUserId, users]);

  /**
   * Generates the chat name based on chat type and participants
   * - For group chats: Uses group name or default
   * - For individual chats: Uses participant name
   * - Handles edge cases (no participants)
   */
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

  /**
   * Calculates the number of unread messages
   * Considers messages not read by the current user
   */
  const unreadCount = useMemo(() => {
    return chat.messages.filter(message =>
      message.senderId !== currentUserId &&
      (message.delivery_status !== 'read' || !message.is_read)
    ).length;
  }, [chat.messages, currentUserId]);

  /**
   * Handles press events on the chat item
   * - In selection mode: Toggles chat selection
   * - Otherwise: Navigates to chat room
   */
  const handlePress = useCallback(() => {
    if (selectedChats.length > 0 || selectedChats.includes(chat.id)) {
      onSelect(chat.id, !selectedChats.includes(chat.id));
    } else {
      navigation.navigate('ChatRoom' as never, { chatId: chat.id } as never);
    }
  }, [chat.id, navigation, selectedChats, onSelect]);

  /**
   * Handles long press events
   * - Toggles chat selection
   * - Provides haptic feedback
   */
  const handleLongPress = useCallback(() => {
    onSelect(chat.id, !selectedChats.includes(chat.id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [chat.id, selectedChats, onSelect]);

  /**
   * Formats the timestamp of the last message
   * - Today: Shows time (HH:MM)
   * - Yesterday: Shows "Yesterday"
   * - This week: Shows day name
   * - Older: Shows date (MMM DD)
   */
  const timeString = useMemo(() => {
    if (!chat.lastMessage || chat.lastMessage.deletedFor.includes(currentUserId)) return '';

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
  }, [chat.lastMessage, currentUserId]);

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
          {chat.lastMessage && !chat.lastMessage.deletedFor.includes(currentUserId) && (
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

/**
 * Component styles
 * 
 * Defines the layout and appearance of the chat list item:
 * - Container layout and borders
 * - Selection state styling
 * - Content layout and spacing
 * - Text styling for name, time, and messages
 * - Unread badge styling
 */
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
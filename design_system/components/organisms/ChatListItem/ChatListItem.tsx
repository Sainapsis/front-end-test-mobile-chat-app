import React from 'react';
import { View, Pressable, Animated } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms/ThemedText';
import { Avatar } from '@/design_system/components/organisms/Avatar';
import { styles as createStyles, getAnimatedStyle } from './ChatListItem.styles';
import { useChatListItem } from '@/hooks/components/useChatListItem';
import { useTheme } from '@/context/ThemeContext';
import { User } from '@/types/User';
import { Chat } from '@/types/Chat';

interface ChatListItemProps {
  /** Chat data to be displayed */
  chat: Chat;
  /** Current user's ID */
  currentUserId: string;
  /** List of users in the chat */
  users: User[];
  /** Function to be called on long press */
  onLongPress?: () => void;
}

/**
 * ChatListItem component displays a chat in a list format.
 * It includes an avatar, chat name, last message, and timestamp.
 * Supports press animations and differentiates messages from the current user.
 */
export function ChatListItem({ chat, currentUserId, users, onLongPress }: ChatListItemProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const {
    scaleAnim,
    opacityAnim,
    handlePressIn,
    handlePressOut,
    otherParticipants,
    chatName,
    handlePress,
    timeString,
    isCurrentUserLastSender,
  } = useChatListItem({ chat, currentUserId, users });

  return (
    <Pressable 
      onPress={handlePress}
      //onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View 
        style={[
          styles.container,
          getAnimatedStyle(scaleAnim, opacityAnim)
        ]}
      >
        <Avatar user={otherParticipants[0]} size={50} />
        <View style={styles.contentContainer}>
          <View style={styles.topRow}>
            <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.name}>
              {chatName}
            </ThemedText>
            {timeString && <ThemedText style={styles.time}>{timeString}</ThemedText>}
          </View>
          <View style={styles.bottomRow}>
            {chat.lastMessage && (
              <ThemedText 
                numberOfLines={1}
                style={[styles.lastMessage, isCurrentUserLastSender && styles.currentUserMessage]}
              >
                {isCurrentUserLastSender && 'You: '}{chat.lastMessage.text}
              </ThemedText>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

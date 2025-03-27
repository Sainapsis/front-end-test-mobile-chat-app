import React from 'react';
import { View, Pressable, Animated } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms/ThemedText';
import { Avatar } from '@/design_system/components/organisms/Avatar';
import { styles, getAnimatedStyle } from './ChatListItem.styles';
import { useChatListItem } from '@/hooks/components/useChatListItem'; // Import the custom hook
import { Chat } from '@/hooks/useChats';
import { User } from '@/hooks/useUser';

interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
  users: User[];
  onLongPress?: () => void; // Se agrega la prop opcional
}

export function ChatListItem({ chat, currentUserId, users, onLongPress }: ChatListItemProps) {
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
      onLongPress={onLongPress}
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

import React, { useMemo, useRef } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Chat } from '@/hooks/useChats';
import { ThemedText } from '@/design_system/components/atoms';
import { Avatar } from '@/design_system/components/organisms';

import { User } from '@/hooks/useUser';
import { StackNavigationProp } from '@react-navigation/stack';
import { styles, getAnimatedStyle } from './ChatListItem.styles';

interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
  users: User[];
  onLongPress?: () => void; // Se agrega la prop opcional
}

type RootStackParamList = {
  ChatRoom: { chatId: string };
};

type NavigationProps = StackNavigationProp<RootStackParamList, 'ChatRoom'>;

export function ChatListItem({ chat, currentUserId, users, onLongPress }: ChatListItemProps) {
  const navigation = useNavigation<NavigationProps>();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const otherParticipants = useMemo(() => {
    return chat.participants
      .filter(id => id !== currentUserId)
      .map(id => users.find(user => user.id === id))
      .filter(Boolean) as User[];
  }, [chat.participants, currentUserId, users]);

  const chatName = useMemo(() => {
    if (otherParticipants.length === 0) return 'No participants';
    if (otherParticipants.length === 1) return otherParticipants[0].name;
    return `${otherParticipants[0].name} & ${otherParticipants.length - 1} other${otherParticipants.length > 2 ? 's' : ''}`;
  }, [otherParticipants]);

  const handlePress = () => {
    navigation.navigate('ChatRoom', { chatId: chat.id });
  };

  const timeString = useMemo(() => {
    if (!chat.lastMessage) return '';
    const date = new Date(chat.lastMessage.timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }, [chat.lastMessage]);

  const isCurrentUserLastSender = chat.lastMessage?.senderId === currentUserId;

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

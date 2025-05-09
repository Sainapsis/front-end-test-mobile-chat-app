import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Chat } from '@/hooks/useChats';
import { Avatar } from './Avatar';
import { TextType, ThemedText } from './ThemedText';
import { User } from '@/hooks/useUser';
import styles from '@/styles/chatListItem.style';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { transformTime } from '@/utils/helpers/time_func';
import { Routes } from '@/constants/Routes';
import { messageFunc } from '@/utils/helpers/message_func';
import { MessageStatus } from '@/database/interface/message';

interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
  users: User[];
}

export type RootStackParamList = {
  ChatRoom: { chatId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ChatListItem({ chat, currentUserId, users }: ChatListItemProps) {
  const navigation = useNavigation<NavigationProp>();
  
  const otherParticipants = useMemo(() => {
    return chat.participants
      .filter(id => id !== currentUserId)
      .map(id => users.find(user => user.id === id))
      .filter(Boolean) as User[];
  }, [chat.participants, currentUserId, users]);

  const chatName = useMemo(() => {
    if (otherParticipants.length === 0) {
      return 'No participants';
    } else if (otherParticipants.length === 1) {
      return otherParticipants[0].name;
    } else {
      return `${otherParticipants[0].name} & ${otherParticipants.length - 1} other${otherParticipants.length > 2 ? 's' : ''}`;
    }
  }, [otherParticipants]);

  const handlePress = () => {
    navigation.navigate(
      Routes.CHATROOM as keyof RootStackParamList,
      { chatId: chat.id },
    );
  };

  const timeString = useMemo(() => {
    if (!chat.lastMessage) return '';
    
    return transformTime.getDiffInDays(chat.lastMessage.timestamp);
  }, [chat.lastMessage]);

  const isCurrentUserLastSender = chat.lastMessage?.senderId === currentUserId;

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Avatar 
        user={otherParticipants[0]} 
        size={50}
      />
      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <ThemedText type={TextType.DEFAULT_SEMI_BOLD} numberOfLines={1} style={styles.name}>
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
              // type='defaultSemiBold'
              style={[
                styles.lastMessage,
                isCurrentUserLastSender && styles.currentUserMessage,
                chat.lastMessage.status !== MessageStatus.READ && styles.unreadMessage,
              ]}
            >
              {isCurrentUserLastSender && 'You: '}{chat.lastMessage.imageUri ? '📷' : chat.lastMessage.text}
            </ThemedText>
          )}
          {chat.lastMessage && isCurrentUserLastSender && (
            <ThemedText style={styles.time}>
              {messageFunc.getMessageStatusIcon(chat.lastMessage.status, true)}
            </ThemedText>
          )}
        </View>
      </View>
    </Pressable>
  );
}

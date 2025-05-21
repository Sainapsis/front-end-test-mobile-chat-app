import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '@/src/presentation/components/chat-list-item/chatListItem.style';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { transformTime } from '@/src/utils/time.util';
import { Routes } from '@/src/presentation/constants/Routes';
import { messageFunc } from '@/src/utils/message.util';
import { Chat } from '@/src/domain/entities/chat';
import { MessageStatus } from '@/src/domain/entities/message';
import { User } from '@/src/domain/entities/user';
import { Avatar } from '../Avatar';
import { ThemedText, TextType } from '../ThemedText';

interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
}

export type RootStackParamList = {
  ChatRoom: { chatId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ChatListItem({ chat, currentUserId }: ChatListItemProps) {  
  const navigation = useNavigation<NavigationProp>();

  const lastMessage = chat.messages[chat.messages.length - 1];
  const otherParticipants = chat.participants;

  const userChat = useMemo(() => {
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
    if (!lastMessage) return '';
    
    return transformTime.getDiffInDays(lastMessage.timestamp);
  }, [lastMessage]);

  const isCurrentUserLastSender = lastMessage?.senderId === currentUserId;

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Avatar 
        user={otherParticipants[0]} 
        size={50}
      />
      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <ThemedText type={TextType.DEFAULT_SEMI_BOLD} numberOfLines={1} style={styles.name}>
            {userChat}
          </ThemedText>
          {timeString && (
            <ThemedText style={styles.time}>{timeString}</ThemedText>
          )}
        </View>
        <View style={styles.bottomRow}>
          {lastMessage && (
            <ThemedText 
              numberOfLines={1}
              style={[
                styles.lastMessage,
                isCurrentUserLastSender && styles.currentUserMessage,
                (lastMessage.status === MessageStatus.Delivered && !isCurrentUserLastSender) && styles.unreadMessage,
              ]}
            >
              {isCurrentUserLastSender && 'You: '}{lastMessage.imageUri ? '📷' : lastMessage.text}
            </ThemedText>
          )}
          {lastMessage && isCurrentUserLastSender && (
            <ThemedText style={styles.time}>
              {messageFunc.getMessageStatusIcon(lastMessage.status, true)}
            </ThemedText>
          )}
        </View>
      </View>
    </Pressable>
  );
}

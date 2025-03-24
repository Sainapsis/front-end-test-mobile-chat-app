import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Chat } from '@/hooks/chats/useChats';
import { Avatar } from '@/components/ui/user/Avatar';
import { ThemedText } from '../../ui/text/ThemedText';
import { User } from '@/hooks/user/useUser';
import { useAppContext } from '@/hooks/AppContext';

interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
  users: User[];
}

export function ChatListItem({ chat, currentUserId }: ChatListItemProps) {
  const navigation = useNavigation();
  const { updateReadStatus } = useAppContext()

  const otherParticipants = useMemo(() => {
    return chat.participants
      .filter(id => id !== currentUserId)
      .map(id => chat.participantsData?.find(user => user.id === id))
      .filter(Boolean) as User[];
  }, [chat.participants, currentUserId, chat.participantsData]);

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
    updateReadStatus(currentUserId, chat.id)
    navigation.navigate('chat-room' as never, { chatId: chat.id } as never);
  };

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

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Avatar
        user={otherParticipants[0]}
        size={50}
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
              {isCurrentUserLastSender && 'You: '}{chat.lastMessage.text}
            </ThemedText>
          )}
          {chat.unreadedMessagesCount > 0?  <ThemedText style={styles.time}>{chat.unreadedMessagesCount}</ThemedText>: <></>}
         
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
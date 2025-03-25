import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Chat } from '@/hooks/useChats';
import { Avatar } from './Avatar';
import { ThemedText } from './ThemedText';
import { User } from '@/hooks/useUser';
import { IconSymbol } from './ui/IconSymbol';
import { selectionFeedback } from '@/utils';

interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
  users: User[];
}

type RootStackParamList = {
  ChatRoom: { chatId: string };
};

export function ChatListItem({ chat, currentUserId, users }: ChatListItemProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const otherParticipants = useMemo(() => {
    return chat.participants
      .filter(id => id !== currentUserId)
      .map(id => users.find(user => user.id === id))
      .filter(Boolean) as User[];
  }, [chat.participants, currentUserId, users]);

  const chatName = useMemo(() => {
    // Si es un chat grupal y tiene nombre, usar ese nombre
    if (chat.isGroup && chat.name) {
      return chat.name;
    }

    // Si no, usar la lógica anterior para formar el nombre
    if (otherParticipants.length === 0) {
      return 'No participants';
    } else if (otherParticipants.length === 1) {
      return otherParticipants[0].name;
    } else {
      return `${otherParticipants[0].name} & ${otherParticipants.length - 1} other${otherParticipants.length > 2 ? 's' : ''}`;
    }
  }, [chat.isGroup, chat.name, otherParticipants]);

  const handlePress = () => {
    selectionFeedback();
    navigation.navigate('ChatRoom', { chatId: chat.id });
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

  const renderAvatar = () => {
    if (chat.isGroup) {
      // Avatar para grupos
      return (
        <View style={styles.groupAvatarContainer}>
          <View style={styles.groupIconContainer}>
            <IconSymbol name="people" size={28} color="#FFFFFF" />
          </View>
        </View>
      );
    }

    // Avatar normal para chats individuales
    return (
      <Avatar
        user={otherParticipants[0]}
        size={50}
      />
    );
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {renderAvatar()}
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
              {isCurrentUserLastSender ? 'You: ' : (
                chat.isGroup ? `${users.find(u => u.id === chat.lastMessage?.senderId)?.name}: ` : ''
              )}
              {chat.lastMessage.text}
            </ThemedText>
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
  groupAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 
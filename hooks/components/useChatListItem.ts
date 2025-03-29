import { useMemo, useRef } from 'react';
import { Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { User } from '@/types/User';
import { Chat } from '@/types/Chat';

type RootStackParamList = {
  ChatRoom: { chatId: string };
};

type NavigationProps = StackNavigationProp<RootStackParamList, 'ChatRoom'>;

interface UseChatListItemProps {
  chat: Chat;
  currentUserId: string;
  users: User[];
}

export function useChatListItem({ chat, currentUserId, users }: UseChatListItemProps) {
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

  return {
    scaleAnim,
    opacityAnim,
    handlePressIn,
    handlePressOut,
    otherParticipants,
    chatName,
    handlePress,
    timeString,
    isCurrentUserLastSender,
  };
}
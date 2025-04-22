import React from 'react';
import { View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Avatar } from '@/components/Avatar';
import { ThemedText } from '@/components/common/ThemedText';
import { MessageStatus } from './MessageStatus';
import { Chat } from '@/interfaces/chatTypes';
import { useAppContext } from '@/hooks/AppContext';
import { chatListItemStyles } from '@/styles/components/chatListItem.styles';
interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
}

export const ChatListItem = ({ chat, currentUserId }: ChatListItemProps) => {
  const { theme } = useAppContext();
  const otherParticipants = chat.participants.filter(user => user.id !== currentUserId);

  const firstParticipant = otherParticipants[0];
  const otherParticipantsCount = otherParticipants.length - 1;

  const getChatName = (): string => {
    if (!firstParticipant) return 'No participants';
    if (otherParticipantsCount === 0) return firstParticipant.name;

    return `${firstParticipant.name} & ${otherParticipantsCount} other${otherParticipantsCount > 1 ? 's' : ''}`;
  };

  const getMessagePreview = (): string => {
    if (!chat.lastMessage) return 'No messages yet';

    const mediaIcons: Record<string, string> = {
      image: '🖼️',
      video: '🎥',
      audio: '🎵',
      file: '📄',
    };

    const { mediaType, text } = chat.lastMessage;
    const icon = mediaType ? mediaIcons[mediaType] : '';
    const previewText = text ? text.substring(0, 30) : mediaType ? mediaType.charAt(0).toUpperCase() + mediaType.slice(1) : '';

    return `${icon} ${previewText || ''}`.trim();
  };

  const getFormattedTime = (): string => {
    if (!chat.lastMessage) return '';

    return new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUnread = chat.lastMessage?.status !== 'read';
  const isOwnMessage = chat.lastMessage?.senderId === currentUserId;

  return (
    <Link href={`/ChatRoom?chatId=${chat.id}`} asChild>
      <Pressable style={{
        borderBottomWidth: 0.2,
        borderBottomColor: theme.colors.border,
        ...chatListItemStyles.container
      }}>
        <Avatar
          uri={firstParticipant?.avatar}
          fallback={firstParticipant?.name?.[0] || '?'}
          size={50}
        />

        <View style={chatListItemStyles.content}>
          <View style={chatListItemStyles.header}>
            <ThemedText style={chatListItemStyles.name} numberOfLines={1}>
              {getChatName()}
            </ThemedText>

            {chat.lastMessage && (
              <ThemedText style={chatListItemStyles.time}>
                {getFormattedTime()}
              </ThemedText>
            )}
          </View>

          <View style={chatListItemStyles.messagePreview}>
            <ThemedText
              style={[chatListItemStyles.preview, isUnread && { color: theme.colors.primary }]}
              numberOfLines={1}
            >
              {getMessagePreview()}
            </ThemedText>

            {isOwnMessage && chat.lastMessage && (
              <MessageStatus message={chat.lastMessage} />
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );
};


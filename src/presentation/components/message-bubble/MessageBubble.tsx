import React, { memo } from 'react';
import { useColorScheme, View } from 'react-native';
import { transformTime } from '@/src/utils/time.util';
import styles from '@/src/presentation/components/message-bubble/messageBubble.style';
import { messageFunc } from '@/src/utils/message.util';
import { Message } from '@/src/domain/entities/message';
import { useUser } from '@/src/presentation/hooks/useUser';
import { Avatar } from '../Avatar';
import { ThemedText } from '../ThemedText';

interface MessageBubbleProps {
  isAGroup: boolean;
  message: Message;
  isCurrentUser: boolean;
}

export const MessageBubble = memo(function MessageBubble({ isAGroup, message, isCurrentUser }: MessageBubbleProps) {
  const { users } = useUser();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getSender = (senderId: string) => {
    const sender = users.find(user => user.id === senderId);
    return sender ?? undefined;
  };

  return (
    <View style={[
      styles.container,
      { alignSelf: isCurrentUser ? 'flex-end' : 'flex-start' },
    ]}>
      {(!isCurrentUser && isAGroup) && <Avatar
        user={getSender(message.senderId)}
        size={32}
        showStatus={false}
      />}
      <View style={[
        styles.bubble,
        isCurrentUser
          ? [styles.selfBubble, { backgroundColor: isDark ? '#235A4A' : '#DCF8C6' }]
          : [styles.otherBubble, { backgroundColor: isDark ? '#2A2C33' : '#FFFFFF' }]
      ]}>
        <ThemedText style={[
          styles.messageText,
          isCurrentUser && !isDark && styles.selfMessageText
        ]}>
          {message.text}
        </ThemedText>
        <View style={styles.timeContainer}>
          <ThemedText style={styles.timeText}>
            {transformTime.formatTime(message.timestamp)}
          </ThemedText>
          {isCurrentUser && <ThemedText style={styles.timeText}>
            {messageFunc.getMessageStatusIcon(message.status, isCurrentUser)}
          </ThemedText>}
        </View>
      </View>
    </View>
  );
});

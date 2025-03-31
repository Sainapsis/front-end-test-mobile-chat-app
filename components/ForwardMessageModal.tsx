import React from 'react';
import { View, StyleSheet, Modal, FlatList, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { Avatar } from './Avatar';
import { useTheme } from '../hooks/theme/useTheme';
import {Chat,User} from '@/utils/types';

interface ForwardMessageModalProps {
  visible: boolean;
  onClose: () => void;
  onForward: (chatId: string) => void;
  chats: Chat[];
  users: User[];
  currentUserId: string;
}

export function ForwardMessageModal({
  visible,
  onClose,
  onForward,
  chats,
  users,
  currentUserId,
}: ForwardMessageModalProps) {
  const { colors } = useTheme();

  const filteredChats = chats.filter(chat => 
    chat.participants.some(id => id !== currentUserId)
  );

  const renderChatItem = ({ item: chat }: { item: Chat }) => {
    const otherParticipants = chat.participants
      .filter(id => id !== currentUserId)
      .map(id => users.find(user => user.id === id))
      .filter(Boolean);

    const chatName = otherParticipants.length === 1
      ? otherParticipants[0]?.name
      : `${otherParticipants[0]?.name} & ${otherParticipants.length - 1} other${otherParticipants.length > 1 ? 's' : ''}`;

    return (
      <Pressable 
        style={[styles.chatItem, { borderBottomColor: colors.border }]}
        onPress={() => onForward(chat.id)}
      >
        <Avatar 
          user={otherParticipants[0]} 
          size={50}
        />
        <View style={styles.chatInfo}>
          <ThemedText type="defaultSemiBold">{chatName}</ThemedText>
          {chat.lastMessage && (
            <ThemedText style={styles.lastMessage} numberOfLines={1}>
              {chat.lastMessage.text}
            </ThemedText>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedView style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Pressable onPress={onClose}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </Pressable>
            <ThemedText type="defaultSemiBold">Reenviar a...</ThemedText>
          </View>

          <FlatList
            data={filteredChats}
            renderItem={renderChatItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 16,
  },
  listContent: {
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  chatInfo: {
    marginLeft: 12,
    flex: 1,
  },
  lastMessage: {
    fontSize: 14,
    color: '#8F8F8F',
    marginTop: 4,
  },
}); 
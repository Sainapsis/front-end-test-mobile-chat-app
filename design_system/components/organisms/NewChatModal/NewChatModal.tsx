import React from 'react';
import { Modal, Pressable, FlatList } from 'react-native';
import { ThemedText, ThemedView } from '@/design_system/components/atoms';
import { UserListItem } from '@/design_system/components/molecules';
import { IconSymbol } from '@/design_system/ui/vendors';
import { styles } from './NewChatModal.styles';

interface NewChatModalProps {
  visible: boolean;
  users: any[];
  currentUserId: string;
  selectedUsers: string[];
  onClose: () => void;
  onToggleUser: (userId: string) => void;
  onCreateChat: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  visible,
  users,
  currentUserId,
  selectedUsers,
  onClose,
  onToggleUser,
  onCreateChat,
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <ThemedView style={styles.modalContainer}>
      <ThemedView style={styles.modalContent}>
        <ThemedView style={styles.modalHeader}>
          <ThemedText type="subtitle">New Chat</ThemedText>
          <Pressable onPress={onClose}>
            <IconSymbol name="xmark" size={24} color="#007AFF" />
          </Pressable>
        </ThemedView>

        <ThemedText style={styles.modalSubtitle}>
          Select users to chat with
        </ThemedText>

        <FlatList
          data={users.filter(user => user.id !== currentUserId)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserListItem
              user={item}
              onSelect={() => onToggleUser(item.id)}
              isSelected={selectedUsers.includes(item.id)}
            />
          )}
          style={styles.userList}
        />

        <Pressable
          style={[styles.createButton, selectedUsers.length === 0 && styles.disabledButton]}
          onPress={onCreateChat}
          disabled={selectedUsers.length === 0}
        >
          <ThemedText style={styles.createButtonText}>
            Create Chat
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  </Modal>
);
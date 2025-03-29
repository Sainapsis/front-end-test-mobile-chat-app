import React from 'react';
import { Modal, Pressable, FlatList } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms/ThemedText';
import { ThemedView } from '@/design_system/components/atoms/ThemedView';
import { UserListItem } from '@/design_system/components/molecules/UserListItem';
import { IconSymbol } from '@/design_system/ui/vendors';
import { styles as createStyles } from './NewChatModal.styles';
import { useTheme } from '@/context/ThemeContext';
import { colors } from '@/design_system/ui/tokens';

interface NewChatModalProps {
  visible: boolean;
  users: any[];
  currentUserId: string;
  selectedUsers: string[];
  onClose: () => void;
  onToggleUser: (userId: string) => void;
  onCreateChat: () => void;
}

export function NewChatModal({
  visible,
  users,
  currentUserId,
  selectedUsers,
  onClose,
  onToggleUser,
  onCreateChat,
}: NewChatModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
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
              <IconSymbol name="xmark" size={24} color={theme != 'light' ?  colors.primary.lighter : colors.primary.dark} />
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
}
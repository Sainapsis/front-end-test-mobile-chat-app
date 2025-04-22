import React, { useState } from 'react';
import { Modal, FlatList } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { UserListItem } from '@/components/chat/UserListItem';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Pressable } from 'react-native';
import { newChatModalStyles } from '@/styles/components/newChatModal.styles';

interface NewChatModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateChat: (participants: string[]) => void;
}

export const NewChatModal = ({ visible, onClose, onCreateChat }: NewChatModalProps) => {
  const { currentUser, users, theme } = useAppContext();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const resetSelection = () => {
    setSelectedUsers([]);
  };

  const handleCreateChat = () => {
    if (currentUser && selectedUsers.length > 0) {
      const participants = [currentUser.id, ...selectedUsers];
      onCreateChat(participants);
      onClose();
      resetSelection();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        onClose();
        resetSelection();
      }}
    >
      <ThemedView style={newChatModalStyles.modalContainer}>
        <ThemedView style={[newChatModalStyles.modalContent, { backgroundColor: theme.colors.backgroundChat }]}>
          <ThemedView style={[newChatModalStyles.modalHeader, { backgroundColor: theme.colors.backgroundChat }]}>
            <ThemedText type="subtitle">New Chat</ThemedText>
            <Pressable onPress={() => {
              onClose();
              resetSelection();
            }}>
              <IconSymbol name="close" size={24} color={theme.colors.error} />
            </Pressable>
          </ThemedView>

          <ThemedText style={newChatModalStyles.modalSubtitle}>
            Select users to chat with
          </ThemedText>

          <FlatList
            data={users.filter(user => user.id !== currentUser?.id)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <UserListItem
                user={item}
                onSelect={() => toggleUserSelection(item.id)}
                isSelected={selectedUsers.includes(item.id)}
              />
            )}
            style={newChatModalStyles.userList}
          />

          <Pressable
            style={[
              newChatModalStyles.createButton,
              { backgroundColor: theme.colors.tint },
              selectedUsers.length === 0 && newChatModalStyles.disabledButton
            ]}
            onPress={handleCreateChat}
            disabled={selectedUsers.length === 0}
          >
            <ThemedText style={[newChatModalStyles.createButtonText, { color: theme.colors.background }]}>
              Create Chat
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};


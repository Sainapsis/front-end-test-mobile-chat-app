import React from 'react';
import { StyleSheet, Pressable, TextInput, FlatList, Modal, Switch } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from '../ui/IconSymbol';
import { UserListItem } from '../UserListItem';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface NewChatModalProps {
  visible: boolean;
  onClose: () => void;
  users: Array<{
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'away';
  }>;
  currentUser: {
    id: string;
  } | null;
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
  isGroup: boolean;
  onGroupToggle: (value: boolean) => void;
  groupName: string;
  onGroupNameChange: (name: string) => void;
  onCreateChat: () => void;
}

export default function NewChatModal({
  visible,
  onClose,
  users,
  currentUser,
  selectedUsers,
  onUserSelect,
  isGroup,
  onGroupToggle,
  groupName,
  onGroupNameChange,
  onCreateChat,
}: NewChatModalProps) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ThemedView style={styles.modalContainer}>
        <ThemedView style={[
          styles.modalContent,
          {
            backgroundColor: Colors[colorScheme].background,
            borderColor: Colors[colorScheme].border,
            borderWidth: 1,
          }
        ]}>
          <ThemedView style={styles.modalHeader}>
            <ThemedText type="subtitle">New Chat</ThemedText>
            <Pressable onPress={onClose}>
              <IconSymbol name="xmark" size={24} color="#007AFF" />
            </Pressable>
          </ThemedView>

          <ThemedView style={styles.groupToggleContainer}>
            <ThemedText>Group Chat</ThemedText>
            <Switch
              value={isGroup}
              onValueChange={onGroupToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isGroup ? '#007AFF' : '#f4f3f4'}
            />
          </ThemedView>

          {isGroup && (
            <ThemedView style={styles.groupNameContainer}>
              <ThemedText>Group Name</ThemedText>
              <TextInput
                style={[
                  styles.groupNameInput,
                  {
                    backgroundColor: Colors[colorScheme].background,
                    color: Colors[colorScheme].text,
                    borderColor: Colors[colorScheme].icon
                  }
                ]}
                value={groupName}
                onChangeText={onGroupNameChange}
                placeholder="Enter group name"
                placeholderTextColor={Colors[colorScheme].icon}
              />
            </ThemedView>
          )}

          <ThemedText style={styles.modalSubtitle}>
            Select users to chat with
          </ThemedText>

          <FlatList
            data={users.filter(user => user.id !== currentUser?.id)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <UserListItem
                user={item}
                onSelect={() => onUserSelect(item.id)}
                isSelected={selectedUsers.includes(item.id)}
              />
            )}
            style={styles.userList}
          />

          <Pressable
            style={[
              styles.createButton,
              (selectedUsers.length === 0 || (isGroup && !groupName)) && styles.disabledButton
            ]}
            onPress={onCreateChat}
            disabled={selectedUsers.length === 0 || (isGroup && !groupName)}
          >
            <ThemedText style={styles.createButtonText}>
              Create {isGroup ? 'Group' : 'Chat'}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  groupToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  groupNameContainer: {
    marginBottom: 20,
  },
  groupNameInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginTop: 8,
    backgroundColor: '#F9F9F9',
  },
  modalSubtitle: {
    marginBottom: 10,
  },
  userList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 
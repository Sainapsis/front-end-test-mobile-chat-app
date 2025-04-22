/**
 * NewChatModal Component
 * 
 * A modal for creating new chats that:
 * - Allows selection of multiple users
 * - Supports both individual and group chats
 * - Handles group name input for group chats
 * - Validates selections before creation
 * - Integrates with the app's theme system
 * 
 * This modal provides the interface for initiating new conversations
 * with one or more users.
 */

import React from 'react';
import { StyleSheet, View, Pressable, TextInput, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { BaseModal } from './BaseModal';
import { UserListItem } from '@/components/UserListItem';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

interface NewChatModalProps {
  visible: boolean;
  onClose: () => void;
  users: any[];
  currentUser: any;
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
  isGroup: boolean;
  onGroupToggle: (value: boolean) => void;
  groupName: string;
  onGroupNameChange: (name: string) => void;
  onCreateChat: () => void;
}

export function NewChatModal({
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
  onCreateChat
}: NewChatModalProps) {
  const colorScheme = useColorScheme() ?? 'light';

  const filteredUsers = users.filter(user => user.id !== currentUser?.id);

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <ThemedText type="title" style={styles.title}>New Chat</ThemedText>
      
      {/* Group Chat Toggle */}
      <View style={styles.groupToggleContainer}>
        <ThemedText>Group Chat</ThemedText>
        <Pressable
          style={[styles.toggleButton, isGroup && styles.toggleButtonActive]}
          onPress={() => onGroupToggle(!isGroup)}
        >
          <View style={[styles.toggleCircle, isGroup && styles.toggleCircleActive]} />
        </Pressable>
      </View>

      {/* Group Name Input */}
      {isGroup && (
        <View style={styles.groupNameContainer}>
          <ThemedText>Group Name</ThemedText>
          <TextInput
            style={[
              styles.groupNameInput,
              {
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].border
              }
            ]}
            value={groupName}
            onChangeText={onGroupNameChange}
            placeholder="Enter group name..."
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
          />
        </View>
      )}

      {/* User Selection List */}
      <ThemedText style={styles.subtitle}>Select Users</ThemedText>
      <FlatList
        data={filteredUsers}
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

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, styles.cancelButton]}
          onPress={onClose}
        >
          <ThemedText style={styles.buttonText}>Cancel</ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.button,
            styles.createButton,
            (!selectedUsers.length || (isGroup && !groupName.trim())) && styles.disabledButton
          ]}
          onPress={onCreateChat}
          disabled={!selectedUsers.length || (isGroup && !groupName.trim())}
        >
          <ThemedText style={styles.createButtonText}>Create</ThemedText>
        </Pressable>
      </View>
    </BaseModal>
  );
}

/**
 * Styles for the NewChatModal component
 * 
 * The styles define:
 * - Title and subtitle text styling
 * - Group toggle appearance
 * - Input field styling
 * - User list layout
 * - Button container and button styling
 * - Consistent spacing and margins
 */
const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  groupToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    padding: 2,
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  toggleCircleActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    transform: [{ translateX: 20 }],
  },
  groupNameContainer: {
    marginBottom: 15,
  },
  groupNameInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  userList: {
    maxHeight: 400,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  createButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 
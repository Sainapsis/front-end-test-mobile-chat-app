import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Pressable, Modal, View } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ChatListItem } from '@/components/ChatListItem';
import { UserListItem } from '@/components/UserListItem';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Message } from '@/types/types';
import styles from '@/styles/IndexStyles';

export default function ChatsScreen() {
  const { currentUser, users, chats, createChat, updateMessageStatus } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    const markAsDelivered = async () => {
      if (!currentUser) return;
      
      // Check all chats for undelivered messages
      for (const chat of chats) {
        const sentMessages = chat.messages.filter(
          (msg: Message) => msg.senderId !== currentUser.id && msg.status === 'sent'
        );
        
        if (sentMessages.length > 0) {
          await updateMessageStatus(chat.id, 'delivered', currentUser.id);
        }
      }
    };
    
    // Mark messages as delivered when entering the chat list
    markAsDelivered();
  }, [chats, currentUser]);

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleCreateChat = () => {
    if (currentUser && selectedUsers.length > 0) {
      const participants = [currentUser.id, ...selectedUsers];
      createChat(participants);
      setModalVisible(false);
      setSelectedUsers([]);
    }
  };

  const renderEmptyComponent = () => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>No chats yet</ThemedText>
      <ThemedText>Tap the + button to start a new conversation</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Chats</ThemedText>
        <Pressable
          style={styles.newChatButton}
          onPress={() => setModalVisible(true)}
        >
          <IconSymbol name="plus" size={24} color="#007AFF" />
        </Pressable>
      </ThemedView>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatListItem
            chat={item}
            currentUserId={currentUser?.id || ''}
            users={users}
          />
        )}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedUsers([]);
        }}
      >
        <ThemedView style={styles.modalContent}>
          <ThemedView style={styles.modalHeader}>
            <ThemedText type="subtitle">New Chat</ThemedText>
            <Pressable onPress={() => {
              setModalVisible(false);
              setSelectedUsers([]);
            }}>
              <IconSymbol name="xmark" size={24} color="#007AFF" />
            </Pressable>
          </ThemedView>

          <ThemedText style={styles.modalSubtitle}>
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
            style={styles.userList}
          />

          <Pressable
            style={[
              styles.createButton,
              selectedUsers.length === 0 && styles.disabledButton
            ]}
            onPress={handleCreateChat}
            disabled={selectedUsers.length === 0}
          >
            <View style={styles.createButtonContent}>
              <IconSymbol name="plus" size={20} color="white" style={styles.createButtonIcon} />
              <ThemedText style={styles.createButtonText}>
                Create Chat
              </ThemedText>
            </View>
          </Pressable>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

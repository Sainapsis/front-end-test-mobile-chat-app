import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Pressable, Modal } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ChatListItem } from '@/components/ChatListItem';
import { UserListItem } from '@/components/UserListItem';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';

export default function ChatsScreen() {
  const { currentUser, users, chats, createChat } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }, []);

  const handleCreateChat = useCallback(() => {
    if (currentUser && selectedUsers.length > 0) {
      const participants = [currentUser.id, ...selectedUsers];
      createChat(participants);
      setModalVisible(false);
      setSelectedUsers([]);
    }
  }, [currentUser, selectedUsers, createChat]);

  const renderEmptyComponent = useCallback(() => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>No chats yet</ThemedText>
      <ThemedText>Tap the + button to start a new conversation</ThemedText>
    </ThemedView>
  ), []);

  const renderChatItem = useCallback(({ item }: { item: any }) => (
    <ChatListItem
      chat={item}
      currentUserId={currentUser?.id || ''}
      users={users}
    />
  ), [currentUser?.id, users]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const renderUserItem = useCallback(({ item }: { item: any }) => (
    <UserListItem
      user={item}
      onSelect={() => toggleUserSelection(item.id)}
      isSelected={selectedUsers.includes(item.id)}
    />
  ), [toggleUserSelection, selectedUsers]);

  const userKeyExtractor = useCallback((item: any) => item.id, []);

  const filteredUsers = useMemo(() =>
    users.filter(user => user.id !== currentUser?.id),
    [users, currentUser?.id]
  );

  const createButtonStyle = useMemo(() => [
    styles.createButton,
    selectedUsers.length === 0 && styles.disabledButton
  ], [selectedUsers.length]);

  const toggleModal = useCallback(() => {
    setModalVisible(prev => !prev);
    if (modalVisible) {
      setSelectedUsers([]);
    }
  }, [modalVisible]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedUsers([]);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Chats</ThemedText>
        <Pressable
          style={styles.newChatButton}
          onPress={toggleModal}
        >
          <IconSymbol name="plus" size={24} color="#007AFF" />
        </Pressable>
      </ThemedView>

      {/* Performance Monitor integrado en el flujo normal */}
      <PerformanceMonitor
        initiallyVisible={true}
        screenName="chats-list"
        itemCount={chats.length}
        itemLabel="Chats"
      />

      <FlatList
        data={chats}
        keyExtractor={keyExtractor}
        renderItem={renderChatItem}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContainer}

        // Performance optimizations
        windowSize={5}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        initialNumToRender={10}

        // Estimate each chat row height to be about 76 points
        getItemLayout={(data, index) => ({
          length: 76,
          offset: 76 * index,
          index,
        })}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText type="subtitle">New Chat</ThemedText>
              <Pressable onPress={closeModal}>
                <IconSymbol name="xmark" size={24} color="#007AFF" />
              </Pressable>
            </ThemedView>

            <ThemedText style={styles.modalSubtitle}>
              Select users to chat with
            </ThemedText>

            <FlatList
              data={filteredUsers}
              keyExtractor={userKeyExtractor}
              renderItem={renderUserItem}
              style={styles.userList}

              // Performance optimizations
              windowSize={5}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              removeClippedSubviews={true}
              initialNumToRender={10}

              // Estimate each user row height to be about 60 points
              getItemLayout={(data, index) => ({
                length: 60,
                offset: 60 * index,
                index,
              })}
            />

            <Pressable
              style={createButtonStyle}
              onPress={handleCreateChat}
              disabled={selectedUsers.length === 0}
            >
              <ThemedText style={styles.createButtonText}>
                Create Chat
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  listContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalSubtitle: {
    marginBottom: 10,
  },
  userList: {
    maxHeight: 400,
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

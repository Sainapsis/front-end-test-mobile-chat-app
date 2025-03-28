import React, { useState } from 'react';
import { FlatList, StyleSheet, Pressable, Modal } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { ThemedText, ThemedView } from '@/design_system/components/atoms';
import { SkeletonLoader, EmptyState } from '@/design_system/components/molecules';
import { ChatListItem, UserListItem } from '@/design_system/components/organisms';
import { IconSymbol } from '@/design_system/ui/vendors';

import { Swipeable } from 'react-native-gesture-handler';
import { spacing } from '@/design_system/ui/tokens';
import { useRouter } from 'expo-router';

export default function ChatsScreen() {
  const router = useRouter();
  const { currentUser, users, chats, createChat, loading, clearChats, deleteChat } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

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

  const handleClearChats = async () => {
    if (currentUser?.id) {
      await clearChats(currentUser.id);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (currentUser?.id) {
      await deleteChat?.(chatId, currentUser.id);
    }
  };

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <ThemedView style={styles.loadingContainer}>
          <SkeletonLoader width="100%" height={70} style={styles.skeletonItem} />
          <SkeletonLoader width="100%" height={70} style={styles.skeletonItem} />
          <SkeletonLoader width="100%" height={70} style={styles.skeletonItem} />
        </ThemedView>
      );
    }

    return (
      <EmptyState
        icon="message.fill"
        title={chats.length > 0 ? "Clear Chats" : "No Conversations Yet"}
        message={chats.length > 0 
          ? "Clear all your conversations" 
          : "Start chatting with your friends by tapping the + button above"
        }
        color="#007AFF"
      />
    );
  };

  const renderRightActions = (chatId: string) => {
    return (
      <Pressable 
        style={styles.deleteAction}
        onPress={() => handleDeleteChat(chatId)}
      >
        <IconSymbol name="trash.fill" size={24} color="white" />
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        {chats.length > 0 && (
          <Pressable
            style={styles.clearAllButton}
            onPress={handleClearChats}
          >
            <ThemedText style={styles.clearAllText}>Clear All</ThemedText>
          </Pressable>
        )}
        <ThemedText type="title">Chats</ThemedText>
        <ThemedView style={styles.headerButtons}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push('/search')}
            disabled={loading}
          >
            <IconSymbol 
              name="magnifyingglass" 
              size={24} 
              color={loading ? '#CCCCCC' : '#007AFF'} 
            />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={() => setModalVisible(true)}
            disabled={loading}
          >
            <IconSymbol 
              name="plus" 
              size={24} 
              color={loading ? '#CCCCCC' : '#007AFF'} 
            />
          </Pressable>
        </ThemedView>
      </ThemedView>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => renderRightActions(item.id)}
            overshootRight={false}
          >
            <ChatListItem
              chat={item}
              currentUserId={currentUser?.id || ''}
              users={users}
              onLongPress={() => handleDeleteChat(item.id)}
            />
          </Swipeable>
        )}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={[
          styles.listContainer,
          !chats.length && styles.emptyListContainer
        ]}
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
        <ThemedView style={styles.modalContainer}>
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
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
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
  loadingContainer: {
    flex: 1,
    padding: 20,
    marginTop: 20,
  },
  skeletonItem: {
    marginBottom: 16,
    borderRadius: 8,
  },
  emptyListContainer: {
    flex: 1,
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  clearAllButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  clearAllText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
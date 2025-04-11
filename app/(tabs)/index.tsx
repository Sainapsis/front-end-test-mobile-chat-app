import React, { useState } from 'react';
import { FlatList, StyleSheet, Pressable, Modal, Image } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ChatListItem } from '@/components/ChatListItem';
import { UserListItem } from '@/components/UserListItem';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ChatsScreen() {
  const { currentUser, users, chats, createChat } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const toggleUserSelection = (userId: string) => {
    if (selectedUserId === userId) {
      setSelectedUserId(null);
    } else {
      setSelectedUserId(userId);
    }
  };

  const handleCreateChat = () => {
    if (currentUser && selectedUserId) {
      const participants = [currentUser.id, selectedUserId];
      createChat(participants);
      setModalVisible(false);
      setSelectedUserId(null);
    }
  };

  const renderEmptyComponent = () => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>No chats yet</ThemedText>
      <ThemedText>Tap the + button to start a new conversation</ThemedText>
    </ThemedView>
  );

  const doesChatExist = () => {
    if (!currentUser || !selectedUserId) return false;

    const selectedSet = new Set([currentUser.id, selectedUserId]);

    return chats.some(chat => {
      const chatSet = new Set(chat.participants);
      return chatSet.size === selectedSet.size &&
             [...chatSet].every(id => selectedSet.has(id));
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Chats</ThemedText>
        <Pressable
          style={styles.newChatButton}
          onPress={() => setModalVisible(true)}
        >
          <Image
            source={require('@/assets/images/addIcon.png')}
            style={styles.addIcon}
            resizeMode="contain"
          />
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
                  isSelected={selectedUserId === item.id}
                />
              )}
              style={styles.userList}
            />

            <Pressable
              style={[
                styles.createButton,
                (!selectedUserId || doesChatExist()) && styles.disabledButton
              ]}
              onPress={handleCreateChat}
              disabled={!selectedUserId || doesChatExist()}
            >
              <ThemedText style={styles.createButtonText}>
                {doesChatExist() ? 'Chat Already Exists' : 'Create Chat'}
              </ThemedText>
            </Pressable>
            <Pressable
              style={styles.cancelButton}
              onPress={() => {
                setModalVisible(false);
                setSelectedUserId(null);
              }}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
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
  addIcon: {
      width: 40,
      height: 40,
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
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#000000',
  },
  cancelButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },

});

import React, { useState, useMemo } from 'react';
import { FlatList, StyleSheet, Pressable, Modal, TextInput, Switch } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ChatListItem } from '@/components/ChatListItem';
import { UserListItem } from '@/components/UserListItem';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { DeleteChatModal } from '@/components/modals/DeleteChatModal';
import { ChatListSkeleton } from '@/components/ChatListSkeleton';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import NewChatModal from '@/components/modals/NewChatModal';

export default function ChatsScreen() {
  const { currentUser, users, chats, createChat, deleteChat, loading } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  const sortedChats = useMemo(() => {
    if (!currentUser?.id) return [];
    return [...chats]
      .filter(chat => {
        const deletedFor = chat.deletedFor || [];
        return !deletedFor.includes(currentUser.id);
      })
      .sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
        const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
        return bTime - aTime;
      });
  }, [chats, currentUser?.id]);

  const handleGroupToggle = (value: boolean) => {
    setIsGroup(value);
    if (!value) {
      setGroupName('');
      if (selectedUsers.length > 1) {
        setSelectedUsers([]);
      }
    }
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleCreateChat = () => {
    if (currentUser && selectedUsers.length > 0) {
      // If it's not a group chat and only one user is selected
      if (!isGroup && selectedUsers.length === 1) {
        // Check if a chat already exists with this user
        const existingChat = sortedChats.find(chat =>
          !chat.isGroup &&
          chat.participants.includes(selectedUsers[0]) &&
          chat.participants.includes(currentUser.id)
        );

        if (existingChat) {
          // Not allowed to create a new chat with the same user
          setModalVisible(false);
          setSelectedUsers([]);
          return;
        }
      }

      const participants = [currentUser.id, ...selectedUsers];
      createChat(participants, isGroup, isGroup ? groupName : undefined);
      setModalVisible(false);
      setSelectedUsers([]);
      setIsGroup(false);
      setGroupName('');
    }
  };

  const handleChatSelect = (chatId: string, isSelected: boolean) => {
    setSelectedChats(prev => {
      if (isSelected) {
        return [...prev, chatId];
      } else {
        return prev.filter(id => id !== chatId);
      }
    });
  };

  const handleDeleteChats = async () => {
    await Promise.all(selectedChats.map(async (chatId) => {
      await deleteChat(chatId);
    }));
    setIsDeleting(false);
    setSelectedChats([]);
  };

  const renderEmptyComponent = () => (
    <ThemedView style={styles.emptyContainer}>
      <IconSymbol name="bubble.left.and.bubble.right" size={64} color={Colors[colorScheme].icon} />
      <ThemedText style={styles.emptyTitle}>No chats yet</ThemedText>
      <ThemedText style={styles.emptySubtitle}>Start a conversation by tapping the + button</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Chats</ThemedText>
        {
          selectedChats.length > 0 ? (
            <Pressable
              style={{ ...styles.newChatButton, ...styles.deleteButton }}
              onPress={() => setIsDeleting(true)}
            >
              <IconSymbol name="trash" size={24} color="red" />
            </Pressable>
          ) : (
            <Pressable
              style={styles.newChatButton}
              onPress={() => setModalVisible(true)}
            >
              <IconSymbol name="plus" size={24} color="#007AFF" />
            </Pressable>
          )
        }
      </ThemedView>

      {loading ? (
        <ChatListSkeleton />
      ) : (
        <FlatList
          data={sortedChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatListItem
              chat={item}
              currentUserId={currentUser?.id || ''}
              users={users}
              selectedChats={selectedChats}
              onSelect={handleChatSelect}
            />
          )}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContainer}
        />
      )}
      < DeleteChatModal
        visible={isDeleting}
        onClose={() => setIsDeleting(false)}
        onDelete={handleDeleteChats}
        selectedCount={selectedChats.length}
      />

      <NewChatModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedUsers([]);
          setIsGroup(false);
          setGroupName('');
        }}
        users={users}
        currentUser={currentUser}
        selectedUsers={selectedUsers}
        onUserSelect={toggleUserSelection}
        isGroup={isGroup}
        onGroupToggle={handleGroupToggle}
        groupName={groupName}
        onGroupNameChange={setGroupName}
        onCreateChat={handleCreateChat}
      />
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
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
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
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 60,
    zIndex: 1000,
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginRight: 20,
    marginTop: 20,
    zIndex: 1001,
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
    padding: 6,
    borderRadius: 15,
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
  groupToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  groupNameContainer: {
    marginBottom: 15,
  },
  groupNameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    color: '#000',
    backgroundColor: '#fff',
  },
});

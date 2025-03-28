import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Pressable, Modal, Platform, UIManager, LayoutAnimation, Animated } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { ChatListItem } from '@/components/chats/list/ChatListItem';
import { UserListItem } from '@/components/users/UserListItem';
import { IconSymbol } from '@/components/ui/icons/IconSymbol';
import { ThemedInput } from '@/components/ui/inputs/ThemedInput';
import { Chat } from '@/hooks/chats/useChats';
import { ChatList } from '@/components/chats/list/ChatList';

// Enable experimental layout animations on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ChatsScreen() {
  const { currentUser, users, chats, createChat, loading } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const headerAnim = useRef(new Animated.Value(1)).current;
  const prevTextRef = useRef<string>('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Effect to animate the header when the search text changes from empty to non-empty and vice versa
  useEffect(() => {
    const wasEmpty = prevTextRef.current.length === 0;
    const isEmpty = searchText.length === 0;
    // If transitioning from empty to non-empty or vice versa, animate header
    if (wasEmpty !== isEmpty) {
      Animated.timing(headerAnim, {
        toValue: isEmpty ? 1 : 0, // 1: full header (when search is empty), 0: collapsed header (when searching)
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    // Update the previous text ref with current search text
    prevTextRef.current = searchText;
  }, [searchText, headerAnim]);

  // Interpolate the animated value to control header height and opacity
  const headerHeight = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });
  const headerOpacity = headerAnim; // Directly use the animated value for opacity

  // Toggle user selection for starting a new chat
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Handle creation of a new chat when the user confirms selection
  const handleCreateChat = () => {
    if (currentUser && selectedUsers.length > 0) {
      const participants = [currentUser.id, ...selectedUsers];
      createChat(participants);
      setModalVisible(false);
      setSelectedUsers([]);
    }
  };

  // Debounce search text changes to filter chats after user stops typing for 300ms
  const handleChangeSearchText = (text: string) => {
    setSearchText(text);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      if (text.length > 0) {
        // Filter chats based on chatName property (case insensitive)
        // Using JSON.parse(JSON.stringify(...)) to deep clone the data, if needed
        setFilteredChats(JSON.parse(JSON.stringify(
          chats.filter(chat =>
            chat.chatName?.toLocaleLowerCase().indexOf(text.toLocaleLowerCase()) !== -1
          )
        )));
      } else {
        setFilteredChats([]);
      }
    }, 300);
  };

  // Render component to show when there are no chats
  const renderEmptyComponent = () => (
    <>
      {!loading &&
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyTextTitle}>No chats yet</ThemedText>
          <ThemedText style={styles.emptyTextSubtitle}>Tap the + button to start a new conversation</ThemedText>
        </ThemedView>
      }
    </>
  );

  const renderNotFoundComponent = () => (
    <>
      {!loading &&
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyTextTitle}>No items found</ThemedText>
          <ThemedText style={styles.emptyTextSubtitle}>Try using different keywords or check your search.</ThemedText>
        </ThemedView>
      }
    </>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Animated header that collapses when search is active */}
      <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
        <ThemedText type="title">Chats</ThemedText>
        <Pressable
          style={styles.newChatButton}
          onPress={() => setModalVisible(true)}
        >
          <IconSymbol name="plus" size={24} color="#007AFF" />
        </Pressable>
      </Animated.View>

      {/* Search input field */}
      <Animated.View>
        <ThemedInput
          style={styles.searchBarContainer}
          textValue={searchText}
          setTextValue={handleChangeSearchText}
          placeholder="Search"
          textArea={false}
        />
      </Animated.View>

      {filteredChats.length > 0 && <ThemedText style={styles.searchTitle}>Chats</ThemedText>}
      {/* Show full chat list if searchText is empty, otherwise show filtered chats */}
      {searchText.length === 0 ?
        <ChatList
          chats={chats}
          users={users}
          currentUser={currentUser || undefined}
          renderEmptyComponent={renderEmptyComponent}>
        </ChatList>
        :
        <ChatList
          chats={filteredChats}
          users={users}
          currentUser={currentUser || undefined}
          renderEmptyComponent={renderNotFoundComponent}>
        </ChatList>
      }

      {/* Modal for creating a new chat */}
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
            {/* Modal header with title and close button */}
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

            {/* List of users to select from for new chat */}
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

            {/* Button to create chat, disabled if no user is selected */}
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
  searchTitle:{
    paddingHorizontal: 15,
    paddingTop: 20,
    fontWeight: 600,
    fontSize: 25,
  },
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTextTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  emptyTextSubtitle: {
    marginBottom: 100
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
  searchBarContainer: {
    paddingBottom: 0,
    paddingTop: 0,
  },
});

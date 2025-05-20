import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable } from "react-native";
import { TextType, ThemedText } from "@/src/presentation/components/ThemedText";
import { ThemedView } from "@/src/presentation/components/ThemedView";
import { IconSymbol } from "@/src/presentation/components/ui/IconSymbol";
import ModalNewChat from "@/src/presentation/components/ModalNewChat";
import { ThemeColors } from "@/src/presentation/constants/Colors";
import styles from "@/src/presentation/screens/chats/chats.style";
import { ChatListItem } from "../../components/chat-list-item/ChatListItem";
import { useSegments } from 'expo-router';
import { useChat } from '../../hooks/useChat';
import { useChatRoom } from '../../hooks/useChatRoom';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../hooks/useUser';

export default function ChatsScreen() {
  const segments = useSegments();
  const { currentUser } = useAuth();
  const { users } = useUser();
  const { loading, userChats, createChat } = useChat({ currentUserId: currentUser?.id || null });
  const { updateMessageToDeliveredStatus } = useChatRoom();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleCreateChat = () => {
    if (currentUser && selectedUsers.length > 0) {
      const chatId = `chat${Date.now()}`;
      const participants = [currentUser.id, ...selectedUsers];
      createChat({ chatId, participantIds: participants });
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

  useEffect(() => {
    if (!currentUser) return;
    
    updateMessageToDeliveredStatus({
      currentUserId: currentUser.id,
    });
  }, [segments]);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type={TextType.TITLE}>Chats</ThemedText>
        <Pressable
          style={styles.newChatButton}
          onPress={() => setModalVisible(true)}
        >
          <IconSymbol name="plus" size={24} color={ThemeColors.blue} />
        </Pressable>
      </ThemedView>

      <FlatList
        // initialNumToRender={1}
        // maxToRenderPerBatch={1}
        // windowSize={1}
        // removeClippedSubviews
        // onEndReached={async () =>
        //   filteredMessages.length >= 10 &&
        //   (await handleLoadMoreMessage({ chatId }))
        // }
        ListHeaderComponent={() => (loading ? (
          <ThemedView
            // style={styles.loadingIndicatorContainer}
          >
            <ActivityIndicator size="large" color="#0000ff" />
          </ThemedView>
        ) : null)}
        // 
        data={userChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatListItem
            chat={item}
            currentUserId={currentUser?.id || ""}
            users={users}
          />
        )}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContainer}
      />

      <ModalNewChat
        users={users}
        currentUser={currentUser}
        modalVisible={modalVisible}
        selectedUsers={selectedUsers}
        setModalVisible={setModalVisible}
        setSelectedUsers={setSelectedUsers}
        handleCreateChat={handleCreateChat}
        toggleUserSelection={toggleUserSelection}
      />
    </ThemedView>
  );
}

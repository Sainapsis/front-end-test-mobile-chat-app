import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable } from "react-native";
import { TextType, ThemedText } from "@/src/presentation/components/ThemedText";
import { ThemedView } from "@/src/presentation/components/ThemedView";
import { IconSymbol } from "@/src/presentation/components/ui/IconSymbol";
import ModalNewChat from "@/src/presentation/components/ModalNewChat";
import { ThemeColors } from "@/src/presentation/constants/Colors";
import styles from "@/src/presentation/screens/chats/chats.style";
import { ChatListItem } from "../../components/chat-list-item/ChatListItem";
import { useSegments } from "expo-router";
import { useChat } from "../../hooks/useChat";
import { useChatRoom } from "../../hooks/useChatRoom";
import { useAuth } from "../../hooks/useAuth";
import { useUser } from "../../hooks/useUser";
import { User } from '@/src/domain/entities/user';

export default function ChatsScreen() {
  const segments = useSegments();
  const { currentUser } = useAuth();
  const { users } = useUser();
  const { loading, userChats, handleLoadMoreChats } = useChat({
    currentUserId: currentUser?.id || null,
  });
  const { updateMessageToDeliveredStatus } = useChatRoom();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const toggleUserSelection = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    if (!user) return;

    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const renderEmptyComponent = () =>
    !loading && (
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
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews
        onEndReached={async () =>
          userChats.length >= 10 && (await handleLoadMoreChats())
        }
        ListHeaderComponent={() =>
          loading ? (
            <ThemedView>
              <ActivityIndicator />
            </ThemedView>
          ) : null
        }
        data={userChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatListItem chat={item} currentUserId={currentUser?.id || ""} />
        )}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContainer}
      />

      <ModalNewChat
        modalVisible={modalVisible}
        selectedUsers={selectedUsers}
        setModalVisible={setModalVisible}
        setSelectedUsers={setSelectedUsers}
        toggleUserSelection={toggleUserSelection}
      />
    </ThemedView>
  );
}

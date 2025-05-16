import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable } from "react-native";
import { TextType, ThemedText } from "@/src/presentation/components/ThemedText";
import { ThemedView } from "@/src/presentation/components/ThemedView";
import { IconSymbol } from "@/src/presentation/components/ui/IconSymbol";
import ModalNewChat from "@/src/presentation/components/ModalNewChat";
import { ThemeColors } from "@/src/presentation/constants/Colors";
import styles from "@/src/presentation/screens/chats/chats.style";
import { MessageStatus } from "@/src/domain/entities/message";
import {
  ChatListItem,
  RootStackParamList,
} from "../../components/chat-list-item/ChatListItem";
import { useUserContext } from "../../context/UserContext";
import { useAuthContext } from "../../context/AuthContext";
import { useChatsContext } from "../../context/ChatsContext";
import { useChats } from "../../hooks/useChats";
import { useChatRoom } from "../../hooks/useChatRoom";
import { useNavigation } from "expo-router";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Routes } from "../../constants/Routes";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ChatsScreen() {
  const { createChat, chats } = useChatsContext();
  const { updateMessageStatus } = useChatRoom({ chatId: "" });
  const { users } = useUserContext();
  const { currentUser } = useAuthContext();
  const { loading } = useChats({ currentUserId: currentUser?.id || null });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const navigation = useNavigation<NavigationProp>();

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
    chats.forEach((chat) => {
      const undeliveredMessages = chat.messages.filter(
        (msg) =>
          msg.senderId !== currentUser?.id && msg.status === MessageStatus.Sent
      );

      undeliveredMessages.forEach((msg) => {
        updateMessageStatus(chat.id, {
          messageId: msg.id,
          status: MessageStatus.Delivered,
        });
      });
    });
  }, [currentUser]);

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </ThemedView>
    );
  }

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
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.containerItem}
            onPress={() => {
              navigation.navigate(Routes.CHATROOM as keyof RootStackParamList, {
                chatId: item.id,
              });
            }}
          >
            <ChatListItem
              chat={item}
              currentUserId={currentUser?.id || ""}
              users={users}
            />
          </Pressable>
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

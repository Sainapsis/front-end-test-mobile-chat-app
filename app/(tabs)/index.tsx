import React, { useEffect, useState } from 'react';
import { FlatList, Pressable } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { TextType, ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ChatListItem } from '@/components/ChatListItem';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ModalNewChat from '@/components/ModalNewChat';
import { ThemeColors } from '@/constants/Colors';
import styles from '@/styles/index.style';
import { MessageStatus } from '@/database/interface/message';

export default function ChatsScreen() {
  const { currentUser, users, chats, createChat, updateMessageStatus } = useAppContext();
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

  const renderEmptyComponent = () => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>No chats yet</ThemedText>
      <ThemedText>Tap the + button to start a new conversation</ThemedText>
    </ThemedView>
  );

  const sortedChats = [...chats].sort((a, b) => {
    const aLast = a.messages[a.messages.length - 1];
    const bLast = b.messages[b.messages.length - 1];

    const aTime = aLast ? new Date(aLast.timestamp).getTime() : 0;
    const bTime = bLast ? new Date(bLast.timestamp).getTime() : 0;

    return bTime - aTime;
  });


  useEffect(() => {
    if (chats && currentUser) {
      chats.forEach(chat => {
        const undeliveredMessages = chat.messages.filter(
          msg =>
            msg.senderId !== currentUser.id &&
            (msg.status === MessageStatus.SENT || msg.status === MessageStatus.DELIVERED)
        );

        undeliveredMessages.forEach(msg => {
          updateMessageStatus(chat.id, msg.id, MessageStatus.DELIVERED);
        });
      });
    }
  }, [chats, currentUser, updateMessageStatus])

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
        data={sortedChats}
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

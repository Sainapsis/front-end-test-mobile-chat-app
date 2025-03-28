import React from 'react';
import { FlatList, Pressable, Modal } from 'react-native';
import { ThemedText, ThemedView } from '@/design_system/components/atoms';
import { SkeletonLoader, EmptyState } from '@/design_system/components/molecules';
import { ChatListItem, UserListItem } from '@/design_system/components/organisms';
import { IconSymbol } from '@/design_system/ui/vendors';
import { Swipeable } from 'react-native-gesture-handler';
import { styles } from './ChatsTemplate.styles';

interface ChatsTemplateProps {
  loading: boolean;
  chats: any[];
  users: any[];
  currentUserId: string;
  selectedUsers: string[];
  modalVisible: boolean;
  onSearch: () => void;
  onCreateChat: () => void;
  onClearChats: () => void;
  onDeleteChat: (chatId: string) => void;
  onToggleUserSelection: (userId: string) => void;
  onCloseModal: () => void;
  onOpenModal: () => void;
}

export const ChatsTemplate: React.FC<ChatsTemplateProps> = ({
  loading,
  chats,
  users,
  currentUserId,
  selectedUsers,
  modalVisible,
  onSearch,
  onCreateChat,
  onClearChats,
  onDeleteChat,
  onToggleUserSelection,
  onCloseModal,
  onOpenModal,
}) => {
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

  const renderRightActions = (chatId: string) => (
    <Pressable 
      style={styles.deleteAction}
      onPress={() => onDeleteChat(chatId)}
    >
      <IconSymbol name="trash.fill" size={24} color="white" />
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        {chats.length > 0 && (
          <Pressable
            style={styles.clearAllButton}
            onPress={onClearChats}
          >
            <ThemedText style={styles.clearAllText}>Clear All</ThemedText>
          </Pressable>
        )}
        <ThemedText type="title">Chats</ThemedText>
        <ThemedView style={styles.headerButtons}>
          <Pressable
            style={styles.iconButton}
            onPress={onSearch}
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
            onPress={onOpenModal}
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
              currentUserId={currentUserId}
              users={users}
              onLongPress={() => onDeleteChat(item.id)}
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
        onRequestClose={onCloseModal}
      >
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText type="subtitle">New Chat</ThemedText>
              <Pressable onPress={onCloseModal}>
                <IconSymbol name="xmark" size={24} color="#007AFF" />
              </Pressable>
            </ThemedView>

            <ThemedText style={styles.modalSubtitle}>
              Select users to chat with
            </ThemedText>

            <FlatList
              data={users.filter(user => user.id !== currentUserId)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <UserListItem
                  user={item}
                  onSelect={() => onToggleUserSelection(item.id)}
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
              onPress={onCreateChat}
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
};

export default ChatsTemplate;
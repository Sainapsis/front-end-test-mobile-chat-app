import React from 'react';
import { FlatList, Pressable } from 'react-native';
import { ThemedView } from '@/design_system/components/atoms/ThemedView';
import { SkeletonLoader } from '@/design_system/components/molecules/SkeletonLoader';
import { EmptyState } from '@/design_system/components/molecules/EmptyState';
import { ChatListItem } from '@/design_system/components/organisms/ChatListItem';
import { IconSymbol } from '@/design_system/ui/vendors';
import { Swipeable } from 'react-native-gesture-handler';
import { styles } from './ChatsList.styles';
import { colors } from '@/design_system/ui/tokens';

interface ChatsListProps {
  /** Whether the list is in a loading state */
  loading: boolean;
  /** Array of chat objects to display */
  chats: any[];
  /** Array of user objects associated with the chats */
  users: any[];
  /** Current user's ID */
  currentUserId: string;
  /** Function to be called when a chat is deleted */
  onDeleteChat: (chatId: string) => void;
}

/**
 * ChatsList component displays a list of chats with swipe-to-delete functionality.
 * It handles loading states and empty states with appropriate visual feedback.
 */
export const ChatsList: React.FC<ChatsListProps> = ({
  loading,
  chats,
  users,
  currentUserId,
  onDeleteChat,
}) => {
  const renderRightActions = (chatId: string) => (
    <Pressable 
      style={styles.deleteAction}
      onPress={() => onDeleteChat(chatId)}
    >
      <IconSymbol name="trash.fill" size={24} color="white" />
    </Pressable>
  );

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
        title="No Conversations Yet"
        message="Start chatting with your friends by tapping the + button above"
        color={colors.warning.main}
      />
    );
  };

  return (
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
  );
};
import React from 'react';
import { FlatList, Pressable } from 'react-native';
import { ThemedView } from '@/design_system/components/atoms';
import { EmptyState, SkeletonLoader } from '@/design_system/components/molecules';
import { ChatListItem } from '@/design_system/components/organisms';
import { IconSymbol } from '@/design_system/ui/vendors';
import { Swipeable } from 'react-native-gesture-handler';
import { styles } from './ChatsList.styles';
import { colors } from '@/design_system/ui/tokens';

interface ChatsListProps {
  loading: boolean;
  chats: any[];
  users: any[];
  currentUserId: string;
  onDeleteChat: (chatId: string) => void;
}

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
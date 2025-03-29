import React from 'react';
import { ThemedView } from '@/design_system/components/atoms';
import { ChatsHeader } from '@/design_system/components/molecules';
import { ChatsList, NewChatModal } from '@/design_system/components/organisms';
import { styles as createStyles } from './ChatsTemplate.styles';
import { useTheme } from '@/context/ThemeContext';

interface ChatsTemplateProps {
  /** Whether the chats are loading */
  loading: boolean;
  /** Array of chat objects */
  chats: any[];
  /** Array of user objects */
  users: any[];
  /** Current user's ID */
  currentUserId: string;
  /** Array of selected user IDs */
  selectedUsers: string[];
  /** Whether the new chat modal is visible */
  modalVisible: boolean;
  /** Function to be called when searching */
  onSearch: () => void;
  /** Function to be called when creating a new chat */
  onCreateChat: () => void;
  /** Function to be called when clearing all chats */
  onClearChats: () => void;
  /** Function to be called when deleting a chat */
  onDeleteChat: (chatId: string) => void;
  /** Function to be called when toggling user selection */
  onToggleUserSelection: (userId: string) => void;
  /** Function to be called when closing the modal */
  onCloseModal: () => void;
  /** Function to be called when opening the modal */
  onOpenModal: () => void;
}

/**
 * ChatsTemplate component provides the main layout for the chats screen.
 * It includes a header, list of chats, and a modal for creating new chats.
 */
export function ChatsTemplate({
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
}: ChatsTemplateProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <ThemedView style={styles.container}>
      <ChatsHeader
        showClearAll={chats.length > 0}
        isLoading={loading}
        onClearAll={onClearChats}
        onSearch={onSearch}
        onNewChat={onOpenModal}
      />

      <ChatsList
        loading={loading}
        chats={chats}
        users={users}
        currentUserId={currentUserId}
        onDeleteChat={onDeleteChat}
      />

      <NewChatModal
        visible={modalVisible}
        users={users}
        currentUserId={currentUserId}
        selectedUsers={selectedUsers}
        onClose={onCloseModal}
        onToggleUser={onToggleUserSelection}
        onCreateChat={onCreateChat}
      />
    </ThemedView>
  );
};

export default ChatsTemplate;
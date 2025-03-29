import React from 'react';
import { ThemedView } from '@/design_system/components/atoms';
import { ChatsHeader } from '@/design_system/components/molecules';
import { ChatsList, NewChatModal } from '@/design_system/components/organisms';
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
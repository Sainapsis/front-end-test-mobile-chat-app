import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { ChatsTemplate } from '@/design_system/components/templates';

export default function ChatsScreen() {
  const router = useRouter();
  const { currentUser, users, chats, createChat, loading, clearChats, deleteChat } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateChat = () => {
    if (currentUser && selectedUsers.length > 0) {
      createChat([currentUser.id, ...selectedUsers]);
      setModalVisible(false);
      setSelectedUsers([]);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedUsers([]);
  };

  return (
    <ChatsTemplate
      loading={loading}
      chats={chats}
      users={users}
      currentUserId={currentUser?.id || ''}
      selectedUsers={selectedUsers}
      modalVisible={modalVisible}
      onSearch={() => router.push('/search')}
      onCreateChat={handleCreateChat}
      onClearChats={() => clearChats(currentUser?.id || '')}
      onDeleteChat={(chatId) => deleteChat?.(chatId, currentUser?.id || '')}
      onToggleUserSelection={toggleUserSelection}
      onCloseModal={handleCloseModal}
      onOpenModal={() => setModalVisible(true)}
    />
  );
}
import React, { useState } from 'react';
import { FlatList, Pressable } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SearchModal } from '@/components/chat/SearchModal';
import { NewChatModal } from '@/components/chat/NewChatModal';
import { chatsScreenStyles } from '@/styles/screens/chatsScreen.styles';

export default function ChatsScreen() {
  const { currentUser, chats, createChat, theme } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  const renderEmptyComponent = () => (
    <ThemedView style={chatsScreenStyles.emptyContainer}>
      <ThemedText style={chatsScreenStyles.emptyText}>No chats yet</ThemedText>
      <ThemedText>Tap the + button to start a new conversation</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={chatsScreenStyles.container}>
      <ThemedView style={chatsScreenStyles.header}>
        <ThemedText type="title">Chats</ThemedText>
        <ThemedView style={chatsScreenStyles.headerButtons}>
          <Pressable
            style={chatsScreenStyles.headerButton}
            onPress={() => setSearchVisible(true)}
          >
            <IconSymbol name="search" size={24} color={theme.colors.tint} />
          </Pressable>
          <Pressable
            style={chatsScreenStyles.headerButton}
            onPress={() => setModalVisible(true)}
          >
            <IconSymbol name="add" size={24} color={theme.colors.tint} />
          </Pressable>
        </ThemedView>
      </ThemedView>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatListItem
            chat={item}
            currentUserId={currentUser?.id || ''}
          />
        )}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={chatsScreenStyles.listContainer}
      />

      <NewChatModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreateChat={createChat}
      />

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />
    </ThemedView>
  );
}

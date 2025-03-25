import React, { useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList,
  KeyboardAvoidingView, 
  Platform,
  ViewToken,
  ViewabilityConfig,
  Pressable
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MessageBubble } from '@/components/MessageBubble';
import { MessageInput } from '@/components/MessageInput';
import { Avatar } from '@/components/Avatar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Message } from '@/hooks/useChats';

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { currentUser, users, chats, markMessageAsRead } = useAppContext();
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  
  const chat = chats.find(c => c.id === chatId);
  
  const chatParticipants = chat?.participants
    .filter(id => id !== currentUser?.id)
    .map(id => users.find(user => user.id === id))
    .filter(Boolean) || [];
  
  const chatName = chatParticipants.length === 1 
    ? chatParticipants[0]?.name 
    : `${chatParticipants[0]?.name || 'Unknown'} & ${chatParticipants.length - 1} other${chatParticipants.length > 1 ? 's' : ''}`;

  // Mark messages as read when they appear in the viewport
  const handleViewableItemsChanged = useCallback(({ 
    viewableItems 
  }: {
    viewableItems: ViewToken[];
    changed: ViewToken[];
  }) => {
    if (!currentUser) return;

    viewableItems.forEach((viewToken) => {
      const message = viewToken.item as Message;
      if (
        message &&
        message.senderId !== currentUser.id && 
        message.status !== 'read' &&
        (!message.readBy || !message.readBy.some(receipt => receipt.userId === currentUser.id))
      ) {
        markMessageAsRead(message.id, currentUser.id);
      }
    });
  }, [currentUser, markMessageAsRead]);

  const viewabilityConfig: ViewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged: handleViewableItemsChanged }
  ]);

  useEffect(() => {
    if (chat?.messages.length && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chat?.messages.length]);

  if (!chat || !currentUser) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>Chat not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="auto" />
      <Stack.Screen 
        options={{
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <Avatar 
                user={chatParticipants[0]} 
                size={32} 
                showStatus={false}
              />
              <ThemedText type="defaultSemiBold" numberOfLines={1}>
                {chatName}
              </ThemedText>
            </View>
          ),
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <IconSymbol name="chevron-left" size={24} color="#007AFF" />
            </Pressable>
          ),
        }} 
      />

      <FlatList
        ref={flatListRef}
        data={chat.messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isCurrentUser={item.senderId === currentUser.id}
          />
        )}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>No messages yet. Say hello!</ThemedText>
          </ThemedView>
        )}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
      />

      <MessageInput chatId={chat.id} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  messagesContainer: {
    padding: 10,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
}); 
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useChatRoom } from '@/hooks/useChatRoom';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MessageBubble } from '@/components/MessageBubble';
import { Avatar } from '@/components/Avatar';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const {
    messages,
    otherParticipants,
    chatName,
    currentUser,
    sendMessage,
    isLoading
  } = useChatRoom(chatId);

  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleSendMessage = useCallback(() => {
    if (messageText.trim() && currentUser) {
      sendMessage(messageText.trim());
      setMessageText('');
      // Scroll to the bottom after sending a message
      setTimeout(scrollToBottom, 100);
    }
  }, [messageText, currentUser, sendMessage]);

  // Scroll to bottom when a new message is added
  const scrollToBottom = useCallback(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, []);

  // Scroll when messages update
  useEffect(() => {
    if (messages.length) {
      // Small delay to ensure the list is rendered
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length, scrollToBottom]);

  // Memoize the empty component to prevent re-renders
  const EmptyComponent = useCallback(() => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText>No messages yet. Say hello!</ThemedText>
    </ThemedView>
  ), []);

  // Memoize the header component
  const HeaderTitle = useCallback(() => (
    <View style={styles.headerContainer}>
      <Avatar
        user={otherParticipants[0]}
        size={32}
        showStatus={false}
      />
      <ThemedText type="defaultSemiBold" numberOfLines={1}>
        {chatName}
      </ThemedText>
    </View>
  ), [otherParticipants, chatName]);

  // Memoize the back button
  const HeaderLeft = useCallback(() => (
    <Pressable onPress={() => router.back()}>
      <IconSymbol name="chevron.left" size={24} color="#007AFF" />
    </Pressable>
  ), [router]);

  // Memoize the renderItem function
  const renderMessage = useCallback(({ item }: { item: any }) => (
    <MessageBubble
      message={item}
      isCurrentUser={item.senderId === currentUser?.id}
    />
  ), [currentUser?.id]);

  // Optimize keyExtractor function
  const keyExtractor = useCallback((item: any) => item.id, []);

  if (isLoading || !currentUser) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>Loading chat...</ThemedText>
      </ThemedView>
    );
  }

  if (!messages && !isLoading) {
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
          headerTitle: HeaderTitle,
          headerLeft: HeaderLeft,
        }}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={keyExtractor}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        inverted={false}
        showsVerticalScrollIndicator={true}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}

        // Performance optimizations
        windowSize={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        initialNumToRender={15}

        // Estimate each message height to be about 80 points - this improves scrolling performance
        getItemLayout={(data, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}

        ListEmptyComponent={EmptyComponent}
      />

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          multiline
        />
        <Pressable
          style={[styles.sendButton, !messageText.trim() && styles.disabledButton]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <IconSymbol name="arrow.up.circle.fill" size={32} color="#007AFF" />
        </Pressable>
      </ThemedView>
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
    justifyContent: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
    backgroundColor: '#F9F9F9',
  },
  sendButton: {
    marginLeft: 10,
    marginBottom: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 
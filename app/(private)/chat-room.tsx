import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ViewToken
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { MessageBubble } from '@/components/chats/messages/MessageBubble';
import { Avatar } from '@/components/ui/user/Avatar';
import { IconSymbol } from '@/components/ui/icons/IconSymbol';
import { ThemedInput } from '@/components/ui/inputs/ThemedInput';
import { ThemedBadge } from '@/components/ui/badges/ThemedBadge';
import { useIsFocused } from '@react-navigation/native';
import { Message } from '@/hooks/db';

// Función auxiliar para formatear fechas
const formatDateLabel = (timestamp: number | string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return date.toLocaleDateString([], { weekday: 'long' });
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { currentUser, chats, sendMessage, updateReadStatus, socket } = useAppContext();
  const [messageText, setMessageText] = useState('');
  const [headerDate, setHeaderDate] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const isFocused = useIsFocused();

  const chat = chats.find(c => c.id === chatId);

  const handleSendMessage = () => {
    if (messageText.trim() && currentUser && chat) {
      sendMessage(chat.id, messageText.trim(), currentUser.id);
      setMessageText('');
    }
  };

  useEffect(() => {
    if (chat?.messages?.length && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 200);
      }, 100);
    }
  }, [chat?.messages?.length]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      flatListRef.current?.scrollToEnd({ animated: false });
    });
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      updateReadStatus(currentUser?.id || '', chatId);
    }, [currentUser, chatId])
  );
  
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      if (isFocused && message.chatId === chatId) {
        updateReadStatus(currentUser?.id || '', chatId);
      }
    };

    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [isFocused, chatId, socket, currentUser, updateReadStatus]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems, changed }: { viewableItems: ViewToken[]; changed: ViewToken[]; }) => {
      if (viewableItems.length > 0) {
        const firstItem = viewableItems[0].item;
        setHeaderDate(formatDateLabel(firstItem.timestamp));
      }
    }
  ).current;

  const viewabilityConfig = { itemVisiblePercentThreshold: 20 };

  const renderDateBadge = (dateLabel: string) => (
    <View style={styles.badgeContainer}>
      <ThemedBadge text={dateLabel} type='secondary' />
    </View>
  );

  if (!chat || !currentUser) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>Chat not found</ThemedText>
      </ThemedView>
    );
  }

  const messagesList = chat.messages || [];

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const currentMessageLabel = formatDateLabel(item.timestamp);
    let showBadge = false;
    if (index === 0) {
      showBadge = true;
    } else {
      const previousMessage = messagesList[index - 1];
      const previousMessageLabel = formatDateLabel(previousMessage.timestamp);
      if (currentMessageLabel !== previousMessageLabel) {
        showBadge = true;
      }
    }

    return (
      <View>
        {showBadge && renderDateBadge(currentMessageLabel)}
        <MessageBubble
          message={item}
          isCurrentUser={item.senderId === currentUser.id}
          isReaded={item.readed}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <Avatar
                userName={chat.chatName}
                size={32}
                status={chat.chatStatus as "online" | "offline" | "away"}
              />
              <ThemedText type="defaultSemiBold" numberOfLines={1}>
                {chat.chatName}
              </ThemedText>
            </View>
          ),
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color="#007AFF" />
            </Pressable>
          ),
        }}
      />
      {headerDate !== '' && (
        <View style={[styles.badgeContainer, styles.badgeHeader]}>
          <ThemedBadge text={headerDate} type='secondary' />
        </View>
      )}
      <FlatList
        ref={flatListRef}
        data={chat.messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>No messages yet. Say hello! {chat.chatStatus}</ThemedText>
          </ThemedView>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <ThemedInput
        shouldShowButton={true}
        textValue={messageText}
        setTextValue={setMessageText}
        handleSendMessage={handleSendMessage}
        placeholder="Write a message"
        style={styles.messageInput}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  badgeContainer: {
    alignSelf: 'center',
  },
  badgeHeader: {
    zIndex: 999,
    position: 'absolute',
    marginTop: 10
  },
  messageInput: {
    paddingBottom: Platform.OS === 'ios' ? 10 : 5,
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
  },
});

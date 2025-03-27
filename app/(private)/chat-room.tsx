import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { MessageBubble } from '@/components/chats/messages/MessageBubble';
import { Avatar } from '@/components/ui/user/Avatar';
import { IconSymbol } from '@/components/ui/icons/IconSymbol';
import { ThemedInput } from '@/components/ui/inputs/ThemedInput';

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { currentUser, chats, sendMessage } = useAppContext();
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const chat = chats.find(c => c.id === chatId);
  // const chatParticipants = chat?.participants
  //   .filter(id => id !== currentUser?.id)
  //   .map(id => chat.participantsData?.find(user => user.id === id))
  //   .filter(Boolean) || [];

  // const chatName = chatParticipants.length === 1
  //   ? chatParticipants[0]?.name
  //   : `${chatParticipants[0]?.name || 'Unknown'} & ${chatParticipants.length - 1} other${chatParticipants.length > 1 ? 's' : ''}`;

  const handleSendMessage = () => {
    if (messageText.trim() && currentUser && chat) {
      sendMessage(chat.id, messageText.trim(), currentUser.id);
      setMessageText('');
    }
  };

  useEffect(() => {
    console.log(chat)
    if (chat?.messages?.length && chat.messages.length > 0 && flatListRef.current) {
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
      // Scroll to the end when the keyboard appears
      flatListRef.current?.scrollToEnd({ animated: false });
    });
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                {""}
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

      <FlatList
        ref={flatListRef}
        data={chat.messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isCurrentUser={item.senderId === currentUser.id}
            isReaded={item.readed}
          />
        )}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>No messages yet. Say hello! {chat.chatStatus}</ThemedText>
          </ThemedView>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      <ThemedInput shouldShowButton={true} textValue={messageText} setTextValue={setMessageText} handleSendMessage={handleSendMessage} placeholder="Write a message" style={styles.messageInput}></ThemedInput>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageInput: {
    paddingBottom: Platform.OS === 'ios' ? 10 : 0
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
    flexGrow: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, KeyboardAvoidingView, Platform, } from 'react-native';
import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { Avatar } from '@/components/ui/user/Avatar';
import { IconSymbol } from '@/components/ui/icons/IconSymbol';
import { ThemedInput } from '@/components/ui/inputs/ThemedInput';
import { useIsFocused } from '@react-navigation/native';
import { Message } from '@/hooks/db';
import { DateBadge } from '@/components/chats/messages/DateBadge';
import { MessagesList } from '@/components/chats/messages/MessagesList';
import { ResponseToContainer } from '@/components/chats/messages/ResponseToContainer';

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { currentUser, chats, sendMessage, updateReadStatus, socket } = useAppContext();
  const [messageText, setMessageText] = useState<string>('');
  const [headerDate, setHeaderDate] = useState<number>(0);
  const [response, setResponse] = useState<string>();
  const [responseId, setResponseId] = useState<string>();
  const [responseTo, setResponseTo] = useState<string>();
  const [showResponsePreview, setShowResponsePreview] = useState<boolean>(false)
  const router = useRouter();
  const isFocused = useIsFocused();

  const chat = chats.find(c => c.id === chatId);

  const handleSendMessage = async () => {
    if (messageText.trim() && currentUser && chat) {
      const messageDataToSend: any = {content: messageText.trim()}
      if(responseTo){
        messageDataToSend.responseTo = responseTo
        messageDataToSend.responseId = responseId
        messageDataToSend.response = response
      }
      await sendMessage(chat.id, messageDataToSend);
      setMessageText('');
      setShowResponsePreview(false)
      setResponse(undefined)
      setResponseTo(undefined)
      setResponseId(undefined)
    }
  }

  const onSwapMessage = (message: Message) => {
    setShowResponsePreview(true)
    setResponse(message.text);
    setResponseId(message.id);
    setResponseTo(message.senderName)
  }

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
      {headerDate !== 0 && (
        <DateBadge timestamp={headerDate} style={styles.badgeHeader}></DateBadge>
      )}
      <MessagesList chat={chat} setHeaderDate={setHeaderDate} onSwapMessage={onSwapMessage}></MessagesList>
      {showResponsePreview &&
        <ResponseToContainer response={response || ''} responseTo={responseTo || ''}></ResponseToContainer>
      }
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
});

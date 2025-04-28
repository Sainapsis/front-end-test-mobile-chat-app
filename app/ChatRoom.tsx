  import React, { useState, useRef, useEffect, useMemo } from 'react';
  import {
    View,
    StyleSheet,
    FlatList,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Image
  } from 'react-native';
  import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
  import { StatusBar } from 'expo-status-bar';
  import { useAppContext } from '@/hooks/AppContext';
  import { ThemedText } from '@/components/ThemedText';
  import { ThemedView } from '@/components/ThemedView';
  import { MessageBubble } from '@/components/MessageBubble';
  import { Avatar } from '@/components/Avatar';
  import { IconSymbol } from '@/components/ui/IconSymbol';

  export default function ChatRoomScreen() {
    const { chatId } = useLocalSearchParams<{ chatId: string }>();
    const { currentUser, users, chats, sendMessage, loadChats, loadChat, updateMessageInChat, deleteMessageInChat, chat } = useAppContext();
    const [messageText, setMessageText] = useState('');
    const flatListRef = useRef<FlatList>(null);
    const router = useRouter();
    const [activeEditMessage, setActiveEditMessage] = useState<string | null>(null);

    const chatParticipants = chat?.participants
      .filter(id => id !== currentUser?.id)
      .map(id => users.find(user => user.id === id))
      .filter(Boolean) || [];

    const chatName = chatParticipants.length === 1
      ? chatParticipants[0]?.name
      : `${chatParticipants[0]?.name || 'Unknown'} & ${chatParticipants.length - 1} other${chatParticipants.length > 1 ? 's' : ''}`;

    const handleSendMessage = () => {
      if (messageText.trim() && currentUser && chat) {
        sendMessage(chat.id, messageText.trim(), currentUser.id);
        setMessageText('');
      }
    };

    const handleEditMessage = async (newText: string) => {
      if (activeEditMessage) {
        const success = await updateMessageInChat(activeEditMessage, { text: newText });
        if (success) {
          setActiveEditMessage(null);
          setMessageText('');
          await loadChat(chatId);
        } else {
          alert('No se pudo editar el mensaje');
        }
      }
    };
    
    const handleDelete = async (messageId: string) => {
      const success = await deleteMessageInChat(messageId);
      if (success) {
        await loadChat(chatId); 
      } else {
        alert('No se pudo eliminar el mensaje');
      }
    };

    useEffect(() => {
      if (chat?.messages.length && flatListRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }, [chat?.messages.length]);


    useEffect(() => {
      if (chatId) {
        loadChat(chatId);
      }
    }, [chatId, loadChat]);


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
                <IconSymbol name="chevron.left" size={24} color="#007AFF" />
              </Pressable>
            ),
          }}
        />
        <Pressable style={{ flex: 1 }} onPress={() => setActiveEditMessage(null)}>
            <FlatList
              ref={flatListRef}
              data={chat.messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MessageBubble
                  message={item}
                  isCurrentUser={item.senderId === currentUser.id}
                  chatId={chat.id}
                  showEmojiPicker={activeEditMessage === item.id}
                  onOpenEmojiPicker={() => setActiveEditMessage(item.id)}
                  onCloseEmojiPicker={() => setActiveEditMessage(null)}
                  setMessageText={setMessageText}
                  setActiveEditMessage={setActiveEditMessage}
                  onDeleteMessage={() => handleDelete(item.id)}
                />
              )}
              contentContainerStyle={styles.messagesContainer}
              ListEmptyComponent={() => (
                <ThemedView style={styles.emptyContainer}>
                  <ThemedText>No messages yet. Say hello!</ThemedText>
                </ThemedView>
              )}
            />
        </Pressable>

        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            multiline
          />
          <Pressable
            style={[styles.sendButton,
                !messageText.trim() && styles.disabledButton, ]}
            onPress={async () => {
              if (activeEditMessage) {
                await handleEditMessage(messageText.trim());
              } else {
                handleSendMessage();
              }
            }}
            disabled={!messageText.trim()}
          >
            <Image
                source={require('@/assets/images/sendIcon.png')}
                style={styles.sendIcon}
                resizeMode="contain"
            />
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
      backgroundColor: '#fff',
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#E1E1E1',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 10,
      maxHeight: 100,
      backgroundColor: '#F9F9F9',
    },
    sendButton: {
      marginLeft: 8,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    sendIcon: {
      width: 40,
      height: 40,
    },
    disabledButton: {
      opacity: 0.4,
    },
  });
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MessageBubble } from '@/components/MessageBubble';
import { Avatar } from '@/components/Avatar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { currentUser, users, chats, sendMessage, updateMessageStatus, addReaction, deleteMessage, editMessage } = useAppContext();
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const navigation = useNavigation();

  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const inputBgColor = useThemeColor({}, 'inputBackground');
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');
  
  const chat = chats.find(c => c.id === chatId);
  
  const chatParticipants = chat?.participants
    .filter(id => id !== currentUser?.id)
    .map(id => users.find(user => user.id === id))
    .filter(Boolean) || [];
  
  const chatName = chatParticipants.length === 1 
    ? chatParticipants[0]?.name 
    : `${chatParticipants[0]?.name || 'Unknown'} & ${chatParticipants.length - 1} other${chatParticipants.length > 1 ? 's' : ''}`;

    const handleSendMessage = async () => {
      if (messageText.trim() && currentUser && chat) {
        const success = await sendMessage(chat.id, messageText.trim(), currentUser.id);
        
        if (success) {
          setMessageText('');
          const newMessages = chats.find(c => c.id === chat.id)?.messages || [];
          const lastMessage = newMessages[newMessages.length - 1];
          
          if (lastMessage) {
            await updateMessageStatus(chat.id, lastMessage.id, 'delivered');
          }
        }
      }
    };

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

  useEffect(() => {
    const markAsRead = async () => {
      if (!currentUser || !chat) return;
      
      const unreadMessages = chat.messages.filter(
        msg => msg.senderId !== currentUser.id && 
              (!msg.readBy || !msg.readBy.includes(currentUser.id))
      );
      
      for (const msg of unreadMessages) {
        await updateMessageStatus(chat.id, msg.id, 'read', currentUser.id);
      }
    };
    
    markAsRead();
  }, [chat, currentUser]);

  useLayoutEffect(() => {
    navigation.setOptions({
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
        <Pressable onPress={() => {console.log('Going back'); router.back();}}>
          <IconSymbol name="chevron.left" size={24} color={tintColor} />
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={chat.messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isCurrentUser={item.senderId === currentUser.id}
            chatId={chatId}
            onReact={(messageId, emoji) => {
              addReaction(chatId, messageId, emoji);
            }}
            onDelete={(messageId) => {
              deleteMessage(chatId, messageId);
            }}
            onEdit={(messageId, newText) => {
              editMessage(chatId, messageId, newText);
            }}
          />
        )}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>No messages yet. Say hello!</ThemedText>
          </ThemedView>
        )}
      />

      <ThemedView style={[styles.inputContainer, { borderTopColor: borderColor }]}>
        <TextInput
          style={[styles.input, { borderColor: borderColor, backgroundColor: inputBgColor, color: textColor }]}
          placeholderTextColor={placeholderColor}
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
          <IconSymbol name="arrow.up.circle.fill" size={32} color={iconColor} />
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
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    marginBottom: 5,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 
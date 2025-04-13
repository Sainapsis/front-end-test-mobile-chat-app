import React, { useState, useRef, useEffect } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MessageBubble } from '@/components/MessageBubble';
import { Avatar } from '@/components/Avatar';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { currentUser, users, chats, sendMessage, markMessagesAsRead, addReaction, removeReaction } = useAppContext();
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (chat && currentUser) {
      // Find messages that were sent by the other user and are not read
      const unreadMessages = chat.messages.filter(
        msg => msg.senderId !== currentUser.id && 
        !msg.is_read && 
        (msg.delivery_status === 'sent' || msg.delivery_status === 'delivered')
      );
      
      // If there are unread messages, mark them as read
      if (unreadMessages.length > 0) {
        // Get the sender ID of the unread messages (should be the same for all)
        const senderId = unreadMessages[0].senderId;
        markMessagesAsRead(chat.id, senderId);
      }
    }
  }, [chat, currentUser, markMessagesAsRead]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      // Compress the image
      const compressedImage = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );
      setSelectedImage(compressedImage.uri);
    }
  };

  const handleSendMessage = () => {
    if ((messageText.trim() || selectedImage) && currentUser && chat) {
      sendMessage(chat.id, messageText.trim(), currentUser.id, selectedImage || undefined);
      setMessageText('');
      setSelectedImage(null);
    }
  };

  const handleReactionPress = (messageId: string, reaction: string) => {
    if (currentUser) {
      addReaction(messageId, currentUser.id, reaction);
    }
  };

  const handleRemoveReaction = (messageId: string) => {
    if (currentUser) {
      removeReaction(messageId, currentUser.id);
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

      <FlatList
        ref={flatListRef}
        data={chat.messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isCurrentUser={item.senderId === currentUser?.id}
            onReactionPress={handleReactionPress}
            onRemoveReaction={handleRemoveReaction}
          />
        )}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>No messages yet. Say hello!</ThemedText>
          </ThemedView>
        )}
      />

      <ThemedView style={styles.inputContainer}>
        <Pressable onPress={pickImage} style={styles.mediaButton}>
          <IconSymbol name="photo" size={24} color="#007AFF" />
        </Pressable>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          multiline
        />
        <Pressable
          style={[styles.sendButton, (!messageText.trim() && !selectedImage) && styles.disabledButton]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() && !selectedImage}
        >
          <IconSymbol name="arrow.up.circle.fill" size={32} color="#007AFF" />
        </Pressable>
      </ThemedView>

      {selectedImage && (
        <ThemedView style={styles.imagePreviewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          <Pressable 
            style={styles.removeImageButton}
            onPress={() => setSelectedImage(null)}
          >
            <IconSymbol name="xmark.circle.fill" size={24} color="#FF3B30" />
          </Pressable>
        </ThemedView>
      )}
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
  mediaButton: {
    marginRight: 10,
    marginBottom: 5,
  },
  imagePreviewContainer: {
    position: 'relative',
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 12,
  },
}); 

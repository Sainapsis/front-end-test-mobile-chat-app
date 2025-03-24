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
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MessageBubble } from '@/components/MessageBubble';
import { Avatar } from '@/components/Avatar';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { currentUser, users, chats, sendMessage } = useAppContext();
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    previewUri: string;
  } | null>(null);
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

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const originalUri = result.assets[0].uri;
      
      // Create optimized preview
      const preview = await manipulateAsync(
        originalUri,
        [{ resize: { width: 400 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );

      // Save images to app's cache directory
      const timestamp = Date.now();
      const originalFilename = `${timestamp}_original.jpg`;
      const previewFilename = `${timestamp}_preview.jpg`;
      
      const cacheDir = FileSystem.cacheDirectory;
      const originalDestUri = `${cacheDir}${originalFilename}`;
      const previewDestUri = `${cacheDir}${previewFilename}`;
      
      await FileSystem.copyAsync({
        from: originalUri,
        to: originalDestUri
      });
      
      await FileSystem.copyAsync({
        from: preview.uri,
        to: previewDestUri
      });

      setSelectedImage({
        uri: originalDestUri,
        previewUri: previewDestUri
      });
    }
  };

  const handleSendMessage = () => {
    if ((!messageText.trim() && !selectedImage) || !currentUser || !chat) return;
    
    sendMessage(chat.id, messageText.trim(), currentUser.id, selectedImage || undefined);
    setMessageText('');
    setSelectedImage(null);
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
      />

      {selectedImage && (
        <ThemedView style={styles.selectedImageContainer}>
          <Image 
            source={{ uri: selectedImage.previewUri }}
            style={styles.selectedImagePreview}
          />
          <Pressable 
            onPress={() => setSelectedImage(null)}
            style={styles.removeImageButton}
          >
            <IconSymbol name="cancel" size={24} color="#FF3B30" />
          </Pressable>
        </ThemedView>
      )}

      <ThemedView style={styles.inputContainer}>
        <Pressable
          style={styles.attachButton}
          onPress={handleImagePick}
        >
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
          style={[styles.sendButton, !messageText.trim() && !selectedImage && styles.disabledButton]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() && !selectedImage}
        >
          <IconSymbol name="arrow-upward" size={32} color="#007AFF" />
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
  attachButton: {
    marginRight: 10,
    marginBottom: 10,
  },
  selectedImageContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
  },
  selectedImagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 12,
  },
}); 
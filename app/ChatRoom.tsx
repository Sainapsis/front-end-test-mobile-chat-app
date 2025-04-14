import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal
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
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { currentUser, users, chats, sendMessage, markMessagesAsRead, addReaction, removeReaction, editMessage, deleteMessage } = useAppContext();
  const colorScheme = useColorScheme() ?? 'light';
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<{ messageId: string; senderId: string }[]>([]);
  const [editingMessage, setEditingMessage] = useState<{ id: string; text: string } | null>(null);
  const [editText, setEditText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
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

  const handleMessageSelect = (messageId: string) => {
    const message = chat?.messages.find(m => m.id === messageId);
    if (!message) return;

    setSelectedMessages(prev => {
      const isSelected = prev.some(
        selected => selected.messageId === messageId && selected.senderId === message.senderId
      );

      if (isSelected) {
        return prev.filter(
          selected => !(selected.messageId === messageId && selected.senderId === message.senderId)
        );
      } else {
        return [...prev, { messageId, senderId: message.senderId }];
      }
    });
  };

  const handleEditMessage = (messageId: string, newText: string) => {
    if (chat && currentUser) {
      editMessage(messageId, newText);
      setSelectedMessages([]);
      setEditingMessage(null);
      setEditText('');
    }
  };

  const handleEditPress = () => {
    const selected = selectedMessages[0];
    const message = chat?.messages.find(m => m.id === selected.messageId);
    if (message) {
      setEditingMessage({ id: message.id, text: message.text });
      setEditText(message.text);
    }
  };

  const handleDeleteMessage = useCallback((messageId: string, deleteForEveryone: boolean) => {
    if (!currentUser || !chat) return;

    const message = chat.messages.find(m => m.id === messageId);
    if (!message) return;

    if (deleteForEveryone) {
      // Delete for everyone
      deleteMessage(messageId, currentUser.id, true);
    } else {
      // Delete for me
      deleteMessage(messageId, currentUser.id, false);
    }

    setSelectedMessages(prev => prev.filter(msg => msg.messageId !== messageId));
  }, [currentUser, chat, deleteMessage]);

  const handleReactionPress = useCallback((messageId: string, reaction: string) => {
    if (!currentUser || !chat) return;

    const message = chat.messages.find(m => m.id === messageId);
    if (!message) return;

    // Add reaction to the message
    message.reactions = {
      ...message.reactions,
      [currentUser.id]: reaction
    };
  }, [currentUser, chat]);

  const handleRemoveReaction = useCallback((messageId: string) => {
    if (!currentUser || !chat) return;

    const message = chat.messages.find(m => m.id === messageId);
    if (!message) return;

    // Remove reaction from the message
    if (message.reactions) {
      delete message.reactions[currentUser.id];
    }
  }, [currentUser, chat]);

  useEffect(() => {
    if (chat?.messages.length && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chat?.messages.length]);

  const filteredMessages = chat?.messages.filter(message =>
    message.text.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDeletePress = () => {
    setShowDeleteMenu(true);
  };

  const handleDeleteForMe = () => {
    selectedMessages.forEach((msg) => {
      handleDeleteMessage(msg.messageId, false);
    });
    setShowDeleteMenu(false);
  };

  const handleDeleteForEveryone = () => {
    selectedMessages.forEach((msg) => {
      handleDeleteMessage(msg.messageId, true);
    });
    setShowDeleteMenu(false);
  };

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
            <Pressable  style={styles.backButton} onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color="#007AFF" />
            </Pressable>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              {selectedMessages.length > 0 ? (
                <>
                  {selectedMessages.length === 1 && selectedMessages[0].senderId === currentUser?.id && (
                    <Pressable onPress={handleEditPress}>
                      <IconSymbol name="pencil" size={24} color={Colors[colorScheme].icon} />
                    </Pressable>
                  )}
                  <Pressable onPress={handleDeletePress}>
                    <IconSymbol name="trash" size={24} color={Colors[colorScheme].icon} />
                  </Pressable>
                </>
              ) : (
                <Pressable onPress={() => setIsSearchVisible(true)}>
                  <IconSymbol name="magnifyingglass" size={24} color={Colors[colorScheme].icon} />
                </Pressable>
              )}

            </View>
          ),
        }}
      />

      <Modal
        visible={isSearchVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSearchVisible(false)}
      >
        <ThemedView style={styles.searchModalContainer}>
          <ThemedView style={{ ...styles.searchHeader }}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: Colors[colorScheme].background,
                  color: Colors[colorScheme].text,
                  borderColor: Colors[colorScheme].icon
                }
              ]}
              placeholder="Search messages..."
              placeholderTextColor={Colors[colorScheme].icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <Pressable onPress={() => setIsSearchVisible(false)}>
              <IconSymbol name="xmark" size={24} color={Colors[colorScheme].tint} />
            </Pressable>
          </ThemedView>

          <FlatList
            data={filteredMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isCurrentUser={item.senderId === currentUser?.id}
                onReactionPress={handleReactionPress}
                onRemoveReaction={handleRemoveReaction}
                selectedMessages={selectedMessages}
              />
            )}
            contentContainerStyle={styles.searchResultsContainer}
          />
        </ThemedView>
      </Modal>

      <Modal
        visible={!!editingMessage}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setEditingMessage(null);
          setEditText('');
        }}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.editModalContainer}>
            <ThemedText type="defaultSemiBold" style={styles.editModalTitle}>
              Edit Message
            </ThemedText>
            <TextInput
              style={[
                styles.editInput,
                {
                  backgroundColor: Colors[colorScheme].background,
                  color: Colors[colorScheme].text,
                  borderColor: Colors[colorScheme].icon
                }
              ]}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
            />
            <View style={styles.editModalButtons}>
              <Pressable
                style={styles.editModalButton}
                onPress={() => {
                  setEditingMessage(null);
                  setEditText('');
                }}
              >
                <ThemedText style={styles.editModalButtonText}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.editModalButton, styles.saveButton]}
                onPress={() => {
                  if (editingMessage) {
                    handleEditMessage(editingMessage.id, editText);
                  }
                }}
              >
                <ThemedText style={[styles.editModalButtonText, styles.saveButtonText]}>
                  Save
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </ThemedView>
      </Modal>
      <Modal
        visible={showDeleteMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteMenu(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDeleteMenu(false)}>
          <View style={[styles.deleteMenu, { top: 20, right: 10 }]}>
            <Pressable style={styles.deleteOption} onPress={handleDeleteForMe}>
              <ThemedText style={styles.deleteOptionText}>Delete for me</ThemedText>
            </Pressable>
            {selectedMessages.filter(msg => msg.senderId !== currentUser?.id).length === 0 && (
              <Pressable style={styles.deleteOption} onPress={handleDeleteForEveryone}>
                <ThemedText style={styles.deleteOptionText}>Delete for everyone</ThemedText>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>

      <FlatList
        ref={flatListRef}
        data={chat?.messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isCurrentUser={item.senderId === currentUser?.id}
            onSelect={() => handleMessageSelect(item.id)}
            isSelected={selectedMessages.some(
              selected => selected.messageId === item.id && selected.senderId === item.senderId
            )}
            onReactionPress={handleReactionPress}
            onRemoveReaction={handleRemoveReaction}
            selectedMessages={selectedMessages}
            selectedCount={selectedMessages.length}
          />
        )}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>No messages yet. Say hello!</ThemedText>
          </ThemedView>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
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
  searchModalContainer: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchResultsContainer: {
    padding: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalContainer: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    gap: 15,
  },
  editModalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editModalButton: {
    padding: 10,
    borderRadius: 8,
  },
  editModalButtonText: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: 'white',
  },
  deleteMenu: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteOption: {
    padding: 4,
  },
  deleteOptionText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  backButton: {
    padding: 8 
  }
}); 

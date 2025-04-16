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
  Alert,
  Keyboard,
  Modal,
  ActivityIndicator
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
import { Audio } from 'expo-av';
import ForwardModal from '@/components/modals/ForwardModal';
import { EditModal } from '@/components/modals/EditModal';
import SearchModal from '@/components/modals/SearchModal';
import { ChatRoomSkeleton } from '@/components/ChatRoomSkeleton';

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const {
    currentUser,
    users,
    chats,
    sendMessage,
    markMessagesAsRead,
    editMessage,
    deleteMessage,
    loadMoreMessages,
    hasMoreMessages,
    loadingMore
  } = useAppContext();
  const colorScheme = useColorScheme() ?? 'light';
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<{ messageId: string; senderId: string, audio: boolean, isForwarded: boolean }[]>([]);
  const [editingMessage, setEditingMessage] = useState<{ id: string; text: string } | null>(null);
  const [messageToEdit, setMessageToEdit] = useState<any>(null);

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

  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | undefined>(undefined);
  const editInputRef = useRef<TextInput>(null);

  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (chat && currentUser) {
      const unreadMessages = chat.messages.filter(
        msg => msg.senderId !== currentUser.id &&
          !msg.is_read &&
          (msg.delivery_status === 'sent' || msg.delivery_status === 'delivered')
      );

      if (unreadMessages.length > 0) {
        const senderId = unreadMessages[0].senderId;
        markMessagesAsRead(chat.id, senderId);
      }
    }
  }, [chat, currentUser, markMessagesAsRead]);

  useEffect(() => {
    if (editingMessage) {
      const timer = setTimeout(() => {
        editInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editingMessage]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
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
    if ((messageText.trim() || selectedImage || voiceUrl) && currentUser && chat) {
      sendMessage(chat.id, messageText.trim(), currentUser.id, selectedImage || undefined, voiceUrl || undefined);
      setMessageText('');
      setSelectedImage(null);
      setVoiceUrl(undefined);
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
        return [...prev, { 
          messageId, 
          senderId: message.senderId, 
          audio: message.voiceUrl ? true : false, 
          isForwarded: message.isForwarded ?? false 
        }];
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
      setMessageToEdit(message);
      setEditingMessage({ id: message.id, text: message.text });
      setEditText(message.text);
    }
  };

  const handleDeleteMessage = useCallback((messageId: string, deleteForEveryone: boolean) => {
    if (!currentUser || !chat) return;

    const message = chat.messages.find(m => m.id === messageId);
    if (!message) return;

    if (deleteForEveryone) {
      deleteMessage(messageId, currentUser.id, true);
    } else {
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
    message.text.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !message.isDeleted &&
    !message.deletedFor?.includes(currentUser?.id || '')
  ) || [];

  const handleDeletePress = () => {
    setShowDeleteMenu(true);
  };

  const handleForwardPress = () => {
    setShowForwardModal(true);
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChats(prev => {
      if (prev.includes(chatId)) {
        return prev.filter(id => id !== chatId);
      } else {
        return [...prev, chatId];
      }
    });
  };

  const handleForwardMessages = () => {
    if (!currentUser || selectedChats.length === 0) return;

    selectedMessages.forEach(msg => {
      const message = chat?.messages.find(m => m.id === msg.messageId);
      if (!message) return;

      selectedChats.forEach(chatId => {
        sendMessage(
          chatId,
          message.text,
          currentUser.id,
          message.imageUrl,
          message.voiceUrl,
          true
        );
      });
    });

    setShowForwardModal(false);
    setSelectedChats([]);
    setSelectedMessages([]);
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

  const startRecording = async () => {
    try {
      // Stop any existing recording first
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);

      // Start timer
      setRecordingDuration(0);
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

      // Clear timer
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }

      if (uri && currentUser && chat) {
        sendMessage(chat.id, '', currentUser.id, '', uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const cancelRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);

      // Clear timer
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to cancel recording');
    }
  };

  const cancelImage = () => {
    setSelectedImage(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 80, // Altura estimada de cada mensaje
    offset: 80 * index,
    index,
  }), []);

  const handleLoadMore = useCallback(() => {
    if (chat?.id && hasMoreMessages[chat.id]) {
      loadMoreMessages(chat.id);
    }
  }, [chat?.id, hasMoreMessages, loadMoreMessages]);

  if (!chat || !currentUser) {
    return <ChatRoomSkeleton />;
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
                isGroup={chat.isGroup}
              />
              <ThemedText type="defaultSemiBold" numberOfLines={1}>
                {chat.isGroup ? chat.groupName : chatName}
              </ThemedText>
            </View>
          ),
          headerLeft: () => (
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color="#007AFF" />
            </Pressable>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              {selectedMessages.length > 0 ? (
                <>
                  {selectedMessages.length === 1 && selectedMessages[0].senderId === currentUser?.id && !selectedMessages[0].audio && !selectedMessages[0].isForwarded && (
                    <Pressable onPress={handleEditPress}>
                      <IconSymbol name="pencil" size={24} color={Colors[colorScheme].icon} />
                    </Pressable>
                  )}
                  <Pressable onPress={handleDeletePress}>
                    <IconSymbol name="trash" size={24} color={Colors[colorScheme].icon} />
                  </Pressable>
                  <Pressable onPress={handleForwardPress}>
                    <IconSymbol name="arrowshape.turn.up.right" size={24} color={Colors[colorScheme].icon} />
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

      <SearchModal
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        filteredMessages={filteredMessages}
        currentUser={currentUser}
        selectedMessages={selectedMessages}
        onReactionPress={handleReactionPress}
        onRemoveReaction={handleRemoveReaction}
      />

      <EditModal
        visible={!!editingMessage}
        onClose={() => {
          setEditingMessage(null);
          setEditText('');
          setMessageToEdit(null);
        }}
        messageToEdit={messageToEdit}
        editText={editText}
        onEditTextChange={setEditText}
        onSave={() => {
          if (editingMessage && editText.trim()) {
            Keyboard.dismiss();
            handleEditMessage(editingMessage.id, editText);
          }
        }}
      />

      <Modal
        visible={showDeleteMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteMenu(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDeleteMenu(false)}>
          <View style={[styles.deleteMenu, { top: 20, right: 10, backgroundColor: Colors[colorScheme].background }]}>
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

      <ForwardModal
        visible={showForwardModal}
        onClose={() => {
          setShowForwardModal(false);
          setSelectedChats([]);
        }}
        chats={chats.filter(c => c.id !== chatId)}
        currentUser={currentUser}
        users={users}
        selectedChats={selectedChats}
        onChatSelect={handleChatSelect}
        onForward={handleForwardMessages}
        selectedMessagesCount={selectedMessages.length}
      />

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
            <IconSymbol name="bubble.left.and.bubble.right" size={64} color={Colors[colorScheme].icon} />
            <ThemedText style={styles.emptyTitle}>No messages yet</ThemedText>
            <ThemedText style={styles.emptySubtitle}>Be the first to say hello!</ThemedText>
          </ThemedView>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          loadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={Colors[colorScheme].tint} />
            </View>
          ) : null
        )}
      />
      <ThemedView style={styles.inputContainer}>
        {!isRecording && <Pressable onPress={pickImage} style={styles.mediaButton}>
          <IconSymbol name="photo" size={24} color="#007AFF" />
        </Pressable>}
        {isRecording ? (
          <View style={styles.recordingContainer}>
            <ThemedText style={styles.recordingDuration}>
              Recording:
            </ThemedText>
            <ThemedText style={styles.recordingDuration}>
              {formatDuration(recordingDuration)}
            </ThemedText>
            <Pressable style={[styles.deleteOption, styles.cancelButton]} onPress={cancelRecording}>
              <ThemedText style={styles.deleteOptionText}>cancel</ThemedText>
            </Pressable>
            <Pressable onPress={stopRecording} style={styles.stopButton}>
              <IconSymbol name="arrow.up.circle.fill" size={32} color="#007AFF" />
            </Pressable>
          </View>
        ) : (
          <>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme].background,
                  color: Colors[colorScheme].text,
                  borderColor: Colors[colorScheme].icon
                }
              ]}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              placeholderTextColor={Colors[colorScheme].icon}
              multiline
            />
            {(!messageText.trim() && !selectedImage) ?
              <Pressable onPress={startRecording} style={styles.sendButton}>
                <IconSymbol name="mic" size={28} color="#007AFF" />
              </Pressable> :
              <Pressable
                style={[styles.sendButton, (!messageText.trim() && !selectedImage) && styles.disabledButton]}
                onPress={handleSendMessage}
                disabled={!messageText.trim() && !selectedImage}
              >
                <IconSymbol name="arrow.up.circle.fill" size={28} color="#007AFF" />
              </Pressable>
            }
          </>
        )}
      </ThemedView>

      {selectedImage && (
        <ThemedView style={styles.imagePreviewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          <View style={styles.imageActionsContainer}>
            <Pressable
              style={styles.removeImageButton}
              onPress={cancelImage}
            >
              <IconSymbol name="xmark.circle.fill" size={24} color="#FF3B30" />
            </Pressable>
          </View>
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
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'gray',
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
  imageActionsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 10,
  },
  removeImageButton: {
    backgroundColor: 'white',
    borderRadius: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
    backgroundColor: '#F9F9F9',
    fontSize: 16,
  },
  deleteMenu: {
    position: 'absolute',
    borderRadius: 8,
    padding: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteOption: {
    padding: 8,
  },
  deleteOptionText: {
    fontSize: 16,
  },
  backButton: {
    padding: 8
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  recordingDuration: {
    fontSize: 16,
    color: '#007AFF',
  },
  stopButton: {
    padding: 5,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  loadingMoreContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
}); 

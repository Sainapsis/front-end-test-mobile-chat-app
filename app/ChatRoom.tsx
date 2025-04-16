/**
 * ChatRoom.tsx
 * 
 * This component implements the main chat room interface where users can:
 * - Send and receive text messages
 * - Share images and voice messages
 * - Edit and delete messages
 * - Forward messages to other chats
 * - Search through message history
 * - React to messages with emojis
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
import { ChatRoomSkeleton } from '@/components/ChatRoomSkeleton';
import { DeleteChatModal } from '@/components/modals/DeleteChatModal';

/**
 * HeaderRight Component
 * 
 * A memoized component that renders the right side of the header with different actions
 * based on whether messages are selected or not.
 * 
 * @param selectedMessages - Array of selected messages
 * @param currentUser - Current user object
 * @param onEdit - Function to handle message editing
 * @param onDelete - Function to handle message deletion
 * @param onForward - Function to handle message forwarding
 * @param onSearch - Function to handle search action
 */
const HeaderRight = React.memo(({
  selectedMessages,
  currentUser,
  onEdit,
  onDelete,
  onForward,
  onSearch
}: {
  selectedMessages: { messageId: string; senderId: string, audio: boolean, isForwarded: boolean }[];
  currentUser: any;
  onEdit: () => void;
  onDelete: () => void;
  onForward: () => void;
  onSearch: () => void;
}) => {
  const colorScheme = useColorScheme() ?? 'light';

  if (selectedMessages.length > 0) {
    return (
      <View style={styles.headerRight}>
        {selectedMessages.length === 1 &&
          selectedMessages[0].senderId === currentUser?.id &&
          !selectedMessages[0].audio &&
          !selectedMessages[0].isForwarded && (
            <Pressable onPress={onEdit}>
              <IconSymbol name="pencil" size={24} color={Colors[colorScheme].icon} />
            </Pressable>
          )}
        <Pressable onPress={onDelete}>
          <IconSymbol name="trash" size={24} color={Colors[colorScheme].icon} />
        </Pressable>
        <Pressable onPress={onForward}>
          <IconSymbol name="arrowshape.turn.up.right" size={24} color={Colors[colorScheme].icon} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.headerRight}>
      <Pressable onPress={onSearch}>
        <IconSymbol name="magnifyingglass" size={24} color={Colors[colorScheme].icon} />
      </Pressable>
    </View>
  );
});

/**
 * ChatRoomScreen Component
 * 
 * Main chat room screen component that handles:
 * - Message display and management
 * - Media sharing (images and voice messages)
 * - Message editing and deletion
 * - Message forwarding
 * - Search functionality
 * - Real-time updates
 */
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
    deleteAllMessages,
    loadingMore
  } = useAppContext();
  const colorScheme = useColorScheme() ?? 'light';
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [selectedMessages, setSelectedMessages] = useState<{ messageId: string; senderId: string, audio: boolean, isForwarded: boolean }[]>([]);
  const [editingMessage, setEditingMessage] = useState<{ id: string; text: string } | null>(null);
  const [messageToEdit, setMessageToEdit] = useState<any>(null);

  const [editText, setEditText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const chat = chats.find(c => c.id === chatId);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | undefined>(undefined);
  const editInputRef = useRef<TextInput>(null);
  const [clearIsVisible, setClearIsVisible] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const chatParticipants = chat?.participants
    .filter(id => id !== currentUser?.id)
    .map(id => users.find(user => user.id === id))
    .filter(Boolean) || [];
  const chatName = chatParticipants.length === 1
    ? chatParticipants[0]?.name
    : `${chatParticipants[0]?.name || 'Unknown'} & ${chatParticipants.length - 1} other${chatParticipants.length > 1 ? 's' : ''}`;

  /**
   * Mark messages as read when chat is opened
   */
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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const results = chat?.messages.reduce<number[]>((acc, message, index) => {
      if (message.text.toLowerCase().includes(query.toLowerCase())) {
        acc.push(index);
      }
      return acc;
    }, []) || [];

    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);

    if (results.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: results[0],
        animated: true,
        viewPosition: 0.5
      });
    }
  }, [chat?.messages]);

  const navigateSearch = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;

    Keyboard.dismiss();

    let newIndex = currentSearchIndex;
    if (direction === 'next') {
      newIndex = (currentSearchIndex + 1) % searchResults.length;
    } else {
      newIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    }

    setCurrentSearchIndex(newIndex);
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: searchResults[newIndex],
        animated: true,
        viewPosition: 0.5
      });
    }
  };

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
  const handleClearChat = async () => {
    await deleteAllMessages(chatId);
    setSelectedMessages([]);
    setClearIsVisible(false);
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
    length: 80,
    offset: 80 * index,
    index,
  }), []);

  const handleLoadMore = useCallback(() => {
    if (chat?.id && hasMoreMessages[chat.id]) {
      loadMoreMessages(chat.id);
    }
  }, [chat?.id, hasMoreMessages, loadMoreMessages]);

  const headerRight = useMemo(() => (
    <HeaderRight
      selectedMessages={selectedMessages}
      currentUser={currentUser}
      onEdit={handleEditPress}
      onDelete={handleDeletePress}
      onForward={handleForwardPress}
      onSearch={() => setIsSearchVisible(true)}
    />
  ), [selectedMessages, currentUser]);

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
            selectedMessages.length > 0 ? (
              <View style={styles.headerContainer}>
                <ThemedText> {selectedMessages.length}</ThemedText>
              </View>
            ) :
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
            selectedMessages.length > 0 ? (
              <Pressable style={styles.backButton} onPress={() => setSelectedMessages([])}>
                <IconSymbol name="chevron.backward" size={24} color="#007AFF" />
              </Pressable>
            ) : (
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <IconSymbol name="chevron.left" size={24} color="#007AFF" />
              </Pressable>
            )
          ),
          headerRight: () => headerRight,
        }}
      />
      {isSearchVisible && (
        <ThemedView style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <IconSymbol name="magnifyingglass" size={20} color={Colors[colorScheme].icon} />
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: Colors[colorScheme].background,
                  color: Colors[colorScheme].text,
                }
              ]}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search messages..."
              placeholderTextColor={Colors[colorScheme].icon}
              autoFocus
            />
            <Pressable onPress={() => {
              setIsSearchVisible(false);
              setSearchQuery('');
              setSearchResults([]);
              setCurrentSearchIndex(-1);
            }}>
              <IconSymbol name="xmark.circle.fill" size={20} color={Colors[colorScheme].icon} />
            </Pressable>
          </View>
          {searchResults.length > 0 && (
            <View style={styles.searchNavigation}>
              <ThemedText style={styles.searchCount}>
                {currentSearchIndex + 1} of {searchResults.length}
              </ThemedText>
              <View style={styles.searchButtons}>
                <Pressable
                  onPress={() => navigateSearch('prev')}
                  style={[styles.searchButton, currentSearchIndex <= 0 && styles.disabledButton]}
                >
                  <IconSymbol name="chevron.up" size={24} color={Colors[colorScheme].tint} />
                </Pressable>
                <Pressable
                  onPress={() => navigateSearch('next')}
                  style={[styles.searchButton, currentSearchIndex >= searchResults.length - 1 && styles.disabledButton]}
                >
                  <IconSymbol name="chevron.down" size={24} color={Colors[colorScheme].tint} />
                </Pressable>
              </View>
            </View>
          )}
        </ThemedView>
      )}

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
            <Pressable style={styles.deleteOption} onPress={() => { setShowDeleteMenu(false); setClearIsVisible(true) }}>
              <ThemedText style={styles.deleteOptionText}>Clear Chat</ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      <DeleteChatModal
        visible={clearIsVisible}
        onClose={() => setClearIsVisible(false)}
        onDelete={handleClearChat}
        selectedCount={chat?.messages.length || 0}
      />

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
        data={chat?.messages.filter((message) => !message.deletedFor.includes(currentUser?.id || ''))}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item, index }) => (
          <MessageBubble
            message={item}
            isGroup={chat.isGroup}
            isCurrentUser={item.senderId === currentUser?.id}
            user={users.find(user => user.id === item.senderId) || currentUser}
            onSelect={() => handleMessageSelect(item.id)}
            isSelected={selectedMessages.some(
              selected => selected.messageId === item.id && selected.senderId === item.senderId
            )}
            onReactionPress={handleReactionPress}
            onRemoveReaction={handleRemoveReaction}
            selectedMessages={selectedMessages}
            selectedCount={selectedMessages.length}
            highlightText={searchQuery}
            isHighlighted={searchResults.includes(index) && index === searchResults[currentSearchIndex]}
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
  searchContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 8,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
  },
  searchNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  searchCount: {
    fontSize: 14,
  },
  searchButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  searchButton: {
    padding: 4,
  },
}); 

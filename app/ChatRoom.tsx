import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAppContext } from "@/hooks/useAppContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MessageBubble } from "@/components/MessageBubble";
import { Avatar } from "@/components/Avatar";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { pickImage } from "@/utils/imageUtils";
import { ForwardMessageModal } from '@/components/ForwardMessageModal';
import { useTheme } from "@react-navigation/native";
import { VoiceRecorder } from "@/components/VoiceRecorder";

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { colors } = useTheme();
  const {
    currentUser,
    users,
    chats,
    sendMessage,
    addReaction,
    removeReaction,
    searchMessages,
    searchResults,
    deleteMessage,
    editMessage,
    updateMessageStatus,
    markMessagesAsRead,
  } = useAppContext();
  const [messageText, setMessageText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const chat = chats.find((c) => c.id === chatId);

  const chatParticipants =
    chat?.participants
      .filter((id) => id !== currentUser?.id)
      .map((id) => users.find((user) => user.id === id))
      .filter(Boolean) || [];

  const chatName =
    chatParticipants.length === 1
      ? chatParticipants[0]?.name
      : `${chatParticipants[0]?.name || "Unknown"} & ${
          chatParticipants.length - 1
        } other${chatParticipants.length > 1 ? "s" : ""}`;


  useEffect(() => {
    if (chat?.messages.length && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chat?.messages.length]);

  const handleSendMessage = async () => {
    if ((messageText.trim() || messageText === "") && currentUser && chat) {
       await sendMessage(
        chat.id,
        messageText.trim(),
        currentUser.id
      );
      setMessageText("");
    }
  };

  const handleSendImage = async () => {
    if (!currentUser || !chat) return;

    const image = await pickImage();
    if (image) {
      await sendMessage(
        chat.id,
        undefined,
        currentUser.id,
        image.uri,
        'image',
        image.thumbnailUri
      );
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!currentUser || !chat) return;
    await addReaction(messageId, currentUser.id, emoji);
  };

  const handleRemoveReaction = async (reactionId: string) => {
    if (!currentUser || !chat) return;
    await removeReaction(reactionId);
  };

  const handleSearch = async (query: string) => {
    if (!currentUser || !chat) return;
    await searchMessages(query, chat.id);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!currentUser || !chat) return;
    await deleteMessage(messageId);
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!currentUser || !chat) return;
    await editMessage(messageId, newText);
  };

  const handleForwardMessage = (messageId: string) => {
    setSelectedMessageId(messageId);
    setShowForwardModal(true);
  };

  const handleForwardToChat = async (targetChatId: string) => {
    if (!selectedMessageId || !currentUser) return;

    const messageToForward = chat?.messages.find(m => m.id === selectedMessageId);
    if (!messageToForward) return;

    // Reenviar el mensaje al chat seleccionado
    if (messageToForward.mediaUrl && messageToForward.mediaType === 'image') {
      await sendMessage(
        targetChatId,
        undefined,
        currentUser.id,
        messageToForward.mediaUrl,
        messageToForward.mediaType,
        messageToForward.mediaThumbnail
      );
    } else if (messageToForward.voiceUrl && messageToForward.voiceDuration && messageToForward.mediaType === 'voice') {
      await sendMessage(
        targetChatId,
        undefined,
        currentUser.id,
        messageToForward.voiceUrl,
        'voice',
        undefined,  
        messageToForward.voiceUrl,
        messageToForward.voiceDuration,
        messageToForward.isVoiceMessage
      );
    } else {
      await sendMessage(
        targetChatId,
        messageToForward.text,
        currentUser.id
      );
    }

    setShowForwardModal(false);
    setSelectedMessageId(null);
  };

  const handleVoiceRecordingComplete = async (uri: string, duration: number) => {
    if (!currentUser || !chat) return;
    
    await sendMessage(
      chat.id,
      undefined,
      currentUser.id,
      uri,
      'voice',
      undefined,  
      uri,
      duration,
      true
    );
    
    setShowVoiceRecorder(false);
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerContainer}>
              {showSearch ? <TextInput style={styles.input} placeholder="Search" 
              onChangeText={handleSearch} /> : 
              <View style={styles.headerContainer}>
              <Avatar user={chatParticipants[0]} size={32} showStatus={false} />
              <ThemedText type="defaultSemiBold" numberOfLines={1}>
                {chatName}
              </ThemedText>
            </View>}
            </View>
          ),
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color="#007AFF" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => setShowSearch(!showSearch)}>
              <IconSymbol name="magnifyingglass" size={24} color="#007AFF" />
            </Pressable>
          ),
        }}
      />

      <FlatList
        ref={flatListRef}
        data={showSearch ? searchResults : chat.messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwnMessage={item.senderId === currentUser.id}
            currentUserId={currentUser.id}
            onAddReaction={handleAddReaction}
            onRemoveReaction={handleRemoveReaction}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onForwardMessage={handleForwardMessage}
          />
        )}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>{showSearch ? "No results found" : "No messages yet. Say hello!"}</ThemedText>
          </ThemedView>
        )}
      />
      {showVoiceRecorder && (
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecordingComplete}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          )}

      <ThemedView style={{
        ...styles.messagesFooter,
        backgroundColor: colors.card,
        borderTopColor: colors.border,
      }}>
        <Pressable style={styles.attachButton} onPress={handleSendImage}>
          <IconSymbol name="photo" size={24} color="#007AFF" />
        </Pressable>
        <Pressable 
              style={styles.attachButton} 
              onPress={() => setShowVoiceRecorder(true)}
            >
              <IconSymbol name="mic" size={24} color="#007AFF" />
            </Pressable>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          multiline
        />
        <Pressable
          style={[
            styles.sendButton,
            !messageText.trim() && styles.disabledButton,
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <IconSymbol name="arrow.up.circle.fill" size={32} color="#007AFF" />
        </Pressable>
      </ThemedView>
      <ForwardMessageModal
        visible={showForwardModal}
        onClose={() => {
          setShowForwardModal(false);
          setSelectedMessageId(null);
        }}
        onForward={handleForwardToChat}
        chats={chats.filter(c => c.id !== chatId)}
        users={users}
        currentUserId={currentUser?.id || ''}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  messagesContainer: {
    padding: 10,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  messagesFooter: {
    flexDirection: "row",
    paddingBottom: 40,
    paddingTop: 10,
    paddingHorizontal: 10,
    alignItems: "flex-end",
    borderTopWidth: 1,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F9F9F9",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
    backgroundColor: "#F9F9F9",
  },
  sendButton: {
    marginLeft: 10,
    marginBottom: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

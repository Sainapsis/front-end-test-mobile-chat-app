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
import { useAppContext } from "@/hooks/AppContext";
import { useChatsDb } from "@/hooks/db/useChatsDb";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MessageBubble } from "@/components/MessageBubble";
import { Avatar } from "@/components/Avatar";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Alert, Modal } from "react-native";
import { useChatMessages } from '@/hooks/db/useChatMessages';


export default function ChatRoomScreen() {

  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const {
    currentUser,
    users,
    chats,
    sendMessage,
    deleteMessage,
    editMessage,
  } = useAppContext();
  const { chatMessages, loadMessagesForChat} = useChatMessages(chatId);

  useEffect(() => {
    loadMessagesForChat();
  }, [loadMessagesForChat]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const chat = chats.find((c) => c.id === chatId);

  useEffect(() => {
    if (chat && chat.messages.length === 0) {
      loadMessagesForChat(); // Cargar mensajes si no están en el estado
    }
  }, [chat, chatId, loadMessagesForChat]);

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

  const handleSendMessage = () => {
    if (messageText.trim() && currentUser && chat) {
      sendMessage(chat.id, messageText.trim(), currentUser.id);
      setMessageText("");
    }
  };

  const handleEditMessage = (messageId: string, newText: string) => {
    if (currentUser && chat) {
      editMessage(chat.id, messageId, newText);
      setMessageText("");
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <Avatar user={chatParticipants[0]} size={32} showStatus={false} />
              <ThemedText type="defaultSemiBold" numberOfLines={1}>
                {chatName}
              </ThemedText>
            </View>
          ),
          headerLeft: () => (
            <Pressable onPressIn={() => router.back()}>
              <Ionicons name="chevron-back-outline" size={24} color="#007AFF" />
            </Pressable>
            ),
          }}
          />

          <FlatList
          ref={flatListRef}
          data={chatMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
          <Pressable
            onLongPress={() => {
              Alert.alert(
                "Manage Message",
                "Chose an action to do to this message",
                [
                  {
                    text: "Edit",
                    onPress: () => {
                      setEditingMessageId(item.id);
                      setMessageText(item.text);
                      setModalVisible(true);
                    },
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteMessage(chat.id, item.id),
                  },
                ]
              );
            }}
          >
            <MessageBubble
              message={item}
              isCurrentUser={item.senderId === currentUser.id}
            />
          </Pressable>
        )}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>No messages yet. Say hello!</ThemedText>
          </ThemedView>
        )}
      />

      <ThemedView style={styles.centerContainer}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <ThemedView style={styles.modalContainer}>
            <TextInput
              style={[styles.input, styles.modalInput]}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Edit your message..."
              multiline
            />
            <Pressable
              onPress={() => {
                if (editingMessageId) {
                  handleEditMessage(editingMessageId, messageText);
                  setModalVisible(false);
                }
              }}
              disabled={!messageText.trim()}
            >
              <Ionicons name="arrow-up-circle" size={32} color="#007AFF" />
            </Pressable>
          </ThemedView>
        </Modal>
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        {/* <Pressable onPressIn={pickImage} style={styles.imageButton}>
          <Ionicons name="image-outline" size={28} color="#007AFF" />
        </Pressable> 
        Comented because the option to select the image was working but the
        function to get the message was not converting the image and instead was
        taking the route of the image.
        */}

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
          <Ionicons name="arrow-up-circle" size={32} color="#007AFF" />
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
    justifyContent: "center",
    alignItems: "center",
  },
  modalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 10,
    padding: 20,
    marginRight: 10,
    backgroundColor: "#FFFFFF",
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
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#E1E1E1",
  },
  modalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 20,
    alignItems: "center",
    padding: 20,
    position: "absolute",
    width: "100%",
    top: "90%",
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
  imageButton: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

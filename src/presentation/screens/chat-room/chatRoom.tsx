import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TextType, ThemedText } from "@/src/presentation/components/ThemedText";
import { ThemedView } from "@/src/presentation/components/ThemedView";
import { Avatar } from "@/src/presentation/components/Avatar";
import { IconSymbol } from "@/src/presentation/components/ui/IconSymbol";
import { ThemeColors } from "@/src/presentation/constants/Colors";
import styles from "@/src/presentation/screens/chat-room/chatRoom.style";

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { Image } from "react-native-expo-image-cache";
import { transformTime } from "@/src/utils/time.util";
import { Message, MessageStatus } from "@/src/domain/entities/message";
import { useAppContext } from "@/src/presentation/hooks/AppContext";
import { MessageBubble } from "../../components/message-bubble/MessageBubble";

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const flatListRef = useRef<FlatList>(null);
  const {
    users,
    currentUser,
    userChats,
    updateStatus,
    deleteMessage,
    editMessage,
    sendMessage,
    handleLoadMoreMessage,
  } = useAppContext();
  const [messageText, setMessageText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [inputSearchdVisible, setInputSearchdVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [images, setImages] = useState<
    Array<{ uri: string; previewUri: string }>
  >([]);

  const chat = userChats.find((chat) => chat.id === chatId);
  const filteredMessages = useMemo(() => {
    if (searchText.trim()) {
      return chat?.messages.filter((msg: Message) =>
        msg.text?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return chat?.messages;
  }, [searchText, chat?.messages]);

  const chatParticipants =
    chat?.participants
      .filter((id: string) => id !== currentUser?.id)
      .map((id: string) => users.find((user) => user.id === id))
      .filter(Boolean) || [];

  const chatName =
    chatParticipants.length === 1
      ? chatParticipants[0]?.name
      : `${chatParticipants[0]?.name || "Unknown"} & ${
          chatParticipants.length - 1
        } other${chatParticipants.length > 1 ? "s" : ""}`;

  const handleSendMessage = async () => {
    if ((!messageText.trim() && images.length === 0) || !currentUser || !chat)
      return;

    // Si está editando mensaje
    if (editingMessageId) {
      editMessage({
        chatId: chat.id,
        messageId: editingMessageId,
        newText: messageText.trim(),
      });
      setEditingMessageId(null);
    } else {
      // Si hay texto, enviamos mensaje de texto
      if (messageText.trim()) {
        await sendMessage(chat.id, {
          id: transformTime.generateUniqueId(),
          senderId: currentUser.id,
          text: messageText.trim(),
          timestamp: Date.now(),
          status: MessageStatus.Sent,
        });
      }

      // Si hay imágenes seleccionadas, enviamos una por una
      images.forEach(async (image) => {
        await sendMessage(chat.id, {
          id: transformTime.generateUniqueId(),
          senderId: currentUser.id,
          imageUri: image.uri,
          timestamp: Date.now(),
          status: MessageStatus.Sent,
        });
      });

      setImages([]);
    }

    setMessageText("");
  };

  const handleEditMessage = (messageId: string, currentText?: string) => {
    setEditingMessageId(messageId);
    setMessageText(currentText || "");
  };

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMessage({ chatId: chat?.id || "", messageId }),
        },
      ]
    );
  };

  const pickAndCompressImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImages = result.assets;
      const processedImages = [];

      for (const img of selectedImages) {
        const originalUri = img.uri;

        // Imagen optimizada (300px)
        const compressed = await ImageManipulator.manipulateAsync(
          originalUri,
          [{ resize: { width: 300 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Imagen preview (20px, muy pequeña)
        const preview = await ImageManipulator.manipulateAsync(
          originalUri,
          [{ resize: { width: 20 } }],
          { compress: 0.4, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Caching imagen principal
        const fileName = compressed.uri.split("/").pop();
        const cachePath = `${FileSystem.cacheDirectory}${fileName}`;
        const fileInfo = await FileSystem.getInfoAsync(cachePath);
        if (!fileInfo.exists) {
          await FileSystem.copyAsync({ from: compressed.uri, to: cachePath });
        }

        // Caching preview
        const previewName = preview.uri.split("/").pop();
        const previewPath = `${FileSystem.cacheDirectory}${previewName}`;
        const previewInfo = await FileSystem.getInfoAsync(previewPath);
        if (!previewInfo.exists) {
          await FileSystem.copyAsync({ from: preview.uri, to: previewPath });
        }

        processedImages.push({
          uri: cachePath,
          previewUri: previewPath,
        });
      }

      setImages(processedImages);
    }
  };

  useEffect(() => {
    if (
      flatListRef.current &&
      chat?.messages.length &&
      chat?.messages.length > 0
    ) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [chat?.messages.length]);

  useEffect(() => {
    if (chat && currentUser) {
      updateStatus(currentUser.id, chat, MessageStatus.Read);
    }
  }, []);

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
          title: "",
          headerShadowVisible: false,
          headerBackVisible: inputSearchdVisible ? false : true,
          headerTitle: () =>
            inputSearchdVisible ? (
              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search messages..."
              />
            ) : (
              <View style={styles.headerContainer}>
                <Avatar
                  user={chatParticipants[0]}
                  size={32}
                  showStatus={false}
                />
                <ThemedText type={TextType.DEFAULT_SEMI_BOLD} numberOfLines={1}>
                  {chatName}
                </ThemedText>
              </View>
            ),
          headerRight: () =>
            !inputSearchdVisible ? (
              <Pressable
                style={styles.sendButton}
                onPress={() => setInputSearchdVisible(true)}
              >
                <IconSymbol
                  name="questionmark"
                  size={24}
                  color={ThemeColors.blue}
                />
              </Pressable>
            ) : (
              <Pressable
                style={styles.sendButton}
                onPress={() => {
                  setInputSearchdVisible(false);
                  setSearchText("");
                }}
              >
                <IconSymbol
                  name="timer.square"
                  size={24}
                  color={ThemeColors.blue}
                />
              </Pressable>
            ),
        }}
      />

      <FlatList
        inverted={filteredMessages && filteredMessages?.length > 0}
        ref={flatListRef}
        data={[...(filteredMessages || [])]}
        keyExtractor={(item: Message) => item.id}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews
        onEndReached={() => handleLoadMoreMessage({ chatId })}
        renderItem={({ item }) => {
          const isCurrentUser = item.senderId === currentUser.id;

          return (
            <Pressable
              onLongPress={() => {
                if (isCurrentUser) {
                  Alert.alert("Message Options", "What would you like to do?", [
                    ...(item.imageUri
                      ? []
                      : [
                          {
                            text: "Edit",
                            onPress: () =>
                              handleEditMessage(item.id, item.text),
                          },
                        ]),
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => handleDeleteMessage(item.id),
                    },
                    { text: "Cancel", style: "cancel" },
                  ]);
                }
              }}
            >
              {item.imageUri ? (
                <Image
                  style={[
                    styles.messageImage,
                    { alignSelf: isCurrentUser ? "flex-end" : "flex-start" },
                  ]}
                  uri={item.imageUri}
                  preview={{ uri: item.imageUri }}
                />
              ) : (
                <MessageBubble
                  isAGroup={chatParticipants.length > 2}
                  message={item}
                  isCurrentUser={isCurrentUser}
                />
              )}
            </Pressable>
          );
        }}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>No messages yet. Say hello!</ThemedText>
          </ThemedView>
        )}
      />

      <ThemedView style={styles.inputContainer}>
        <ScrollView
          horizontal
          style={styles.scrollView}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {images.map((img, index) => (
            <View
              key={index}
              style={[
                styles.imageContainer,
                { marginLeft: index === 0 ? 10 : 0 },
              ]}
            >
              <Image
                style={styles.image}
                uri={img.uri}
                preview={{ uri: img.previewUri }}
              />
            </View>
          ))}
        </ScrollView>
        <View style={styles.inputRow}>
          <Pressable style={styles.sendButton} onPress={pickAndCompressImages}>
            <IconSymbol name="photo" size={32} color={ThemeColors.blue} />
          </Pressable>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder={
              editingMessageId ? "Edit your message..." : "Type a message..."
            }
            multiline
          />
          <Pressable
            style={[
              styles.sendButton,
              !messageText.trim() &&
                images.length === 0 &&
                styles.disabledButton,
            ]}
            onPress={handleSendMessage}
            // disabled={!messageText.trim() && selectedImages.length === 0}
          >
            <IconSymbol
              name={
                editingMessageId ? "checklist.checked" : "arrow.up.circle.fill"
              }
              size={32}
              color={ThemeColors.blue}
            />
          </Pressable>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

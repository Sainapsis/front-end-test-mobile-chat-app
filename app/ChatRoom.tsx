import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MessageBubble } from '@/components/MessageBubble';
import { Avatar } from '@/components/Avatar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { MediaAttachment, Message, User } from '@/types/types';
import styles from '@/styles/ChatRoomStyles';

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
    .filter((id: String) => id !== currentUser?.id)
    .map((id: String) => users.find(user => user.id === id))
    .filter(Boolean) as User[] || [];
  
  const chatName = chatParticipants.length === 1 
    ? chatParticipants[0]?.name 
    : `${chatParticipants[0]?.name || 'Unknown'} & ${chatParticipants.length - 1} other${chatParticipants.length > 1 ? 's' : ''}`;

  const [mediaAttachments, setMediaAttachments] = useState<MediaAttachment[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      allowsMultipleSelection: true,
    });
  
    if (!result.canceled) {
      const processedImages = await Promise.all(
        result.assets.map(async (asset) => {
          const compressedImage = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );
          
          return {
            uri: compressedImage.uri,
            previewUri: compressedImage.uri,
            type: 'image' as const
          };
        })
      );
      
      setMediaAttachments(prev => [...prev, ...processedImages]);
    }
  };

  const handleSendMessage = async () => {
    if ((messageText.trim() || mediaAttachments.length > 0) && currentUser && chat) {
      const success = await sendMessage(chat.id, messageText.trim(), currentUser.id, mediaAttachments);
      
      if (success) {
        setMessageText('');
        setMediaAttachments([]);
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
        (msg: Message) => msg.senderId !== currentUser.id && 
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
            <ThemedText>Say hello!</ThemedText>
          </ThemedView>
        )}
      />
      {mediaAttachments.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.mediaPreviewContainer}
        >
          {mediaAttachments.map((media, index) => (
            <Image
              key={`preview-${index}`}
              source={{ uri: media.uri }}
              style={styles.mediaThumbnail}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}
      <ThemedView style={[styles.inputContainer, { borderTopColor: borderColor }]}>
        <TouchableOpacity 
            onPress={pickImage} 
            style={styles.mediaButton}
          >
            <IconSymbol name="camera.fill" size={24} color={iconColor} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { borderColor: borderColor, backgroundColor: inputBgColor, color: textColor }]}
          placeholderTextColor={placeholderColor}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          multiline
        />
        <Pressable
          style={[styles.sendButton, (!messageText.trim() && mediaAttachments.length === 0) && styles.disabledButton]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() && mediaAttachments.length === 0}
        >
          <IconSymbol name="arrow.up.circle.fill" size={32} color={iconColor} />
        </Pressable>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
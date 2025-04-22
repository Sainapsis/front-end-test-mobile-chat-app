import React from 'react';
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { chatRoomScreenStyles } from '@/styles/screens/chatRoomScreenStyles.styles';
import { Media } from '@/interfaces/chatTypes';

interface ChatInputProps {
  messageText: string;
  setMessageText: (text: string) => void;
  selectedMedia: Media | null;
  isSending: boolean;
  onSend: () => void;
  onShowMediaOptions: () => void;
  onPickImage: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  messageText,
  setMessageText,
  selectedMedia,
  isSending,
  onSend,
  onShowMediaOptions,
  onPickImage,
}) => {
  const { theme } = useAppContext();

  return (
    <ThemedView style={[chatRoomScreenStyles.inputContainer]}>
      <View style={chatRoomScreenStyles.inputButtonsContainer}>
        <Pressable
          style={chatRoomScreenStyles.mediaButton}
          onPress={onShowMediaOptions}
          disabled={isSending}
        >
          <IconSymbol name="attach" size={24} color={theme.colors.tint} />
        </Pressable>
        <Pressable
          style={chatRoomScreenStyles.mediaButton}
          onPress={onPickImage}
          disabled={isSending}
        >
          <IconSymbol name="image" size={24} color={theme.colors.tint} />
        </Pressable>
      </View>
      <TextInput
        style={[chatRoomScreenStyles.input, {
          backgroundColor: theme.colors.backgroundChat,
          borderColor: theme.colors.border,
          color: theme.colors.text,
        }]}
        value={messageText}
        onChangeText={setMessageText}
        placeholder="Type a message..."
        placeholderTextColor={theme.colors.text}
        multiline
        editable={!isSending}
      />
      <Pressable
        style={[
          chatRoomScreenStyles.sendButton,
          (!messageText.trim() && !selectedMedia) && chatRoomScreenStyles.disabledButton,
          isSending && chatRoomScreenStyles.sendingButton
        ]}
        onPress={onSend}
        disabled={(!messageText.trim() && !selectedMedia) || isSending}
      >
        {isSending ? (
          <ActivityIndicator color={theme.colors.tint} />
        ) : (
          <IconSymbol name="arrow-up-circle" size={32} color={theme.colors.tint} />
        )}
      </Pressable>
    </ThemedView>
  );
}; 
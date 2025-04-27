import React from 'react';
import { View, StyleSheet, Dimensions  } from 'react-native';
import { EmojiReactions } from './EmojiReaction';
import { Message } from '@/hooks/useChats';

interface MessageOptionsProps {
  message: Message;
  chatId: string;
  currentEmoji: string | null;
  //showEmojiPicker: boolean;
  //onOpenEmojiPicker: () => void;
  onCloseEmojiPicker: () => void;
  onEmojiSelect: (emoji: string | null) => void;
  //setMessageText: (text: string) => void;
  //setActiveEditMessage: (id: string | null) => void;
  //onDeleteMessage: (chatId: string, messageId: string) => Promise<void>;
}

const screenWidth = Dimensions.get('window').width;

export function MessageOptions({
  message,
  chatId,
  currentEmoji,
  onCloseEmojiPicker,
  onEmojiSelect,
}: MessageOptionsProps) {
  return (
    <View style={styles.optionsContainer}>
      <EmojiReactions
        message={message}
        chatId={chatId}
        currentEmoji={currentEmoji}
        onCloseEmojiPicker={onCloseEmojiPicker}
        onEmojiSelect={onEmojiSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginTop: 10, // separarlo del mensaje
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'flex-start', // que siga el flujo
    maxWidth: '100%', // para no salirse del burbuja
    elevation: 3,
  },
});
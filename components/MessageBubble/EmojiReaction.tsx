import React from 'react';
import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useChats,Message } from '@/hooks/useChats';

interface EmojiReactionsProps {
  message: Message;
  chatId: string;
  currentEmoji: string | null;
  onCloseEmojiPicker: () => void;
  onEmojiSelect: (emoji: string | null) => void;
}

const emojis = ['😂', '❤️', '👍', '🔥', '😮'];

export function EmojiReactions({
  message,
  chatId,
  currentEmoji,
  onCloseEmojiPicker,
  onEmojiSelect,
  
}: EmojiReactionsProps) {
  const { updateMessage } = useChats(null);
  
  const handleEmojiSelect = async (emoji: string) => {
    if (currentEmoji === emoji) {
      await updateMessage(chatId, message.id, { reaction: null });
      onEmojiSelect(null);
    } else {
      await updateMessage(chatId, message.id, { reaction: emoji });
      onEmojiSelect(emoji);
    }
    onCloseEmojiPicker();
  };

  return (
    <View style={styles.container}>
      {emojis.map((emoji) => (
        <Pressable
          key={emoji}
          onPress={() => handleEmojiSelect(emoji)}
          style={styles.emojiButton}
        >
          <ThemedText style={styles.emojiText}>{emoji}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 6,
    elevation: 5,
    maxWidth: 240,
  },
  emojiButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emojiText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
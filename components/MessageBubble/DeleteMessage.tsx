import React from 'react';
import { Pressable, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface DeleteMessageProps {
  chatId: string;
  messageId: string;
  onDeleteMessage: (chatId: string, messageId: string) => Promise<void>;
  onCloseEmojiPicker: () => void;
}

export function DeleteMessage({
  chatId,
  messageId,
  onDeleteMessage,
  onCloseEmojiPicker,
}: DeleteMessageProps) {
  const handleDelete = () => {
    Alert.alert(
      'Delete message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await onDeleteMessage(chatId, messageId);
            onCloseEmojiPicker();
          },
        },
      ]
    );
  };

  return (
    <Pressable onPress={handleDelete} style={styles.deleteButton}>
      <ThemedText style={styles.deleteText}>Delete</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
  },
  deleteText: {
    fontSize: 14,
    color: '#333',
  },
});
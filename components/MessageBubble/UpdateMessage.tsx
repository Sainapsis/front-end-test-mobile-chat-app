import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Message } from '@/hooks/useChats';

interface UpdateMessageProps {
  message: Message;
  onCloseEmojiPicker: () => void;
  setMessageText: (text: string) => void;
  setActiveEditMessage: (id: string | null) => void;
}

export function UpdateMessage({
  message,
  onCloseEmojiPicker,
  setMessageText,
  setActiveEditMessage,
}: UpdateMessageProps){
  const [newText, setNewText] = useState(message.text);

  return (
    <View style={[styles.container, { width: 205 }]}>
      <Pressable
        style={styles.actionButton}
        onPress={() => {
          onCloseEmojiPicker();
          setMessageText(newText);
          setActiveEditMessage(message.id);
        }}
      >
        <ThemedText style={styles.actionText}>Edit</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 6,
    elevation: 5,
    maxWidth: 205,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
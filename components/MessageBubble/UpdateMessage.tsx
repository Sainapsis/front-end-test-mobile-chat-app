import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface UpdateMessageProps {
  chatId: string;
  messageId: string;
  currentText: string;
  onUpdateMessage: (chatId: string, messageId: string, newText: string) => Promise<void>;
  onCloseUpdate: () => void;
}

export function UpdateMessage({
  chatId,
  messageId,
  currentText,
  onUpdateMessage,
  onCloseUpdate,
}: UpdateMessageProps) {
  const [newText, setNewText] = useState(currentText);

  const handleUpdate = async () => {
    if (newText.trim() === '') {
      return; // Evitar actualizaciones con texto vacío
    }
    await onUpdateMessage(chatId, messageId, newText);
    onCloseUpdate();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={newText}
        onChangeText={setNewText}
        placeholder="Edit your message"
        multiline
      />
      <View style={styles.actions}>
        <Pressable onPress={onCloseUpdate} style={styles.cancelButton}>
          <ThemedText style={styles.cancelText}>Cancel</ThemedText>
        </Pressable>
        <Pressable onPress={handleUpdate} style={styles.updateButton}>
          <ThemedText style={styles.updateText}>Update</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  cancelText: {
    fontSize: 14,
    color: '#333',
  },
  updateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  updateText: {
    fontSize: 14,
    color: '#fff',
  },
});
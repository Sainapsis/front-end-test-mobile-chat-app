import React from 'react';
import { View, StyleSheet, Pressable, Modal } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface MessageOptionsProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isOwnMessage: boolean;
}

export function MessageOptions({
  visible,
  onClose,
  onEdit,
  onDelete,
  isOwnMessage,
}: MessageOptionsProps) {
  if (!isOwnMessage) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <ThemedView style={styles.optionsContainer}>
          <Pressable style={styles.option} onPress={onEdit}>
            <IconSymbol name="pencil" size={20} color="#007AFF" />
            <ThemedText style={styles.optionText}>Editar</ThemedText>
          </Pressable>
          <Pressable style={styles.option} onPress={onDelete}>
            <IconSymbol name="trash" size={20} color="#FF3B30" />
            <ThemedText style={[styles.optionText, styles.deleteText]}>
              Eliminar
            </ThemedText>
          </Pressable>
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    width: '80%',
    maxWidth: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color:"#007AFF"
  },
  deleteText: {
    color: '#FF3B30',
  },
}); 
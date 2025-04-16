import React, { useRef } from 'react';
import { StyleSheet, View, Pressable, TextInput, Keyboard } from 'react-native';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { BaseModal } from './BaseModal';
import { MessageBubble } from '../MessageBubble';

interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  messageToEdit: {
    id: string;
    text: string;
    timestamp?: number;
    delivery_status?: 'sending' | 'sent' | 'delivered' | 'read';
    is_read?: boolean;
    is_edited?: boolean;
    isDeleted?: boolean;
    deletedFor?: string[];
  } | null;
  editText: string;
  onEditTextChange: (text: string) => void;
  onSave: () => void;
}

export function EditModal({
  visible,
  onClose,
  messageToEdit,
  editText,
  onEditTextChange,
  onSave
}: EditModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const editInputRef = useRef<TextInput>(null);

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
    >
      <View style={[
        styles.modalHeader,
        { borderBottomColor: Colors[colorScheme].icon }
      ]}>
        <View>
          <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
            Edit Message
          </ThemedText>
        </View>
        <Pressable
          style={styles.closeButton}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        >
          <IconSymbol name="xmark" size={20} color={Colors[colorScheme].icon} />
        </Pressable>
      </View>
      <MessageBubble
        message={{
          id: '-1',
          senderId: '-1',
          text: messageToEdit?.text || '',
          timestamp: messageToEdit?.timestamp,
          delivery_status: messageToEdit?.delivery_status,
          is_read: messageToEdit?.is_read,
          is_edited: messageToEdit?.is_edited,
          isDeleted: messageToEdit?.isDeleted,
          deletedFor: messageToEdit?.deletedFor,
          review: true,
        }}
        isCurrentUser={true}
        selectedMessages={[]}
      />
      <View style={styles.editInputContainer}>
        <TextInput
          ref={editInputRef}
          style={[
            styles.input,
            {
              backgroundColor: Colors[colorScheme].background,
              color: Colors[colorScheme].text,
              borderColor: Colors[colorScheme].icon
            }
          ]}
          value={editText}
          onChangeText={onEditTextChange}
          multiline
          autoFocus
          placeholder="Edit your message..."
          placeholderTextColor={Colors[colorScheme].icon}
        />
        <Pressable
          style={[styles.editSendButton, !editText.trim() && styles.disabledButton]}
          onPress={() => {
            if (editText.trim()) {
              Keyboard.dismiss();
              onSave();
            }
          }}
          disabled={!editText.trim()}
        >
          <IconSymbol name="arrow.up.circle.fill" size={32} color="#007AFF" />
        </Pressable>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  editInputContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  editSendButton: {
    marginBottom: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 
import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface DeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  canDeleteForEveryone: boolean;
}

export function DeleteModal({
  visible,
  onClose,
  onDeleteForMe,
  onDeleteForEveryone,
  canDeleteForEveryone
}: DeleteModalProps) {
  const colorScheme = useColorScheme();

  if (!visible) return null;

  return (
    <Pressable style={styles.modalOverlay} onPress={onClose}>
      <View style={[
        styles.deleteMenu,
        { backgroundColor: Colors[colorScheme].background }
      ]}>
        <Pressable style={styles.deleteOption} onPress={onDeleteForMe}>
          <ThemedText style={[
            styles.deleteOptionText,
            { color: Colors[colorScheme].tint }
          ]}>
            Delete for me
          </ThemedText>
        </Pressable>
        {canDeleteForEveryone && (
          <Pressable style={styles.deleteOption} onPress={onDeleteForEveryone}>
            <ThemedText style={[
              styles.deleteOptionText,
              { color: Colors[colorScheme].tint }
            ]}>
              Delete for everyone
            </ThemedText>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  deleteMenu: {
    position: 'absolute',
    borderRadius: 8,
    padding: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteOption: {
    padding: 8,
  },
  deleteOptionText: {
    fontSize: 16,
  },
}); 
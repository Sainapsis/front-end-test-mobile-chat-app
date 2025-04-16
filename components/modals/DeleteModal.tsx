/**
 * DeleteModal Component
 * 
 * A confirmation modal for deletion actions that:
 * - Displays a warning message
 * - Provides confirm and cancel options
 * - Handles deletion confirmation
 * - Integrates with the app's theme system
 * 
 * This modal is used for confirming deletion of various items
 * throughout the application.
 */

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
  const colorScheme = useColorScheme() ?? 'light';

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

/**
 * Styles for the DeleteModal component
 * 
 * The styles define:
 * - Title and message text styling
 * - Button container layout
 * - Button appearance and states
 * - Consistent spacing and margins
 */
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
/**
 * BaseModal Component
 * 
 * A reusable base modal component that provides:
 * - Consistent modal behavior across the app
 * - Standardized animation and presentation
 * - Theme-aware styling
 * - Backdrop handling
 * 
 * This component serves as the foundation for all other modal components
 * in the application, ensuring consistent behavior and appearance.
 */

import React from 'react';
import { StyleSheet, Modal, Pressable, View } from 'react-native';
import { ThemedView } from '../ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BaseModal({ visible, onClose, children }: BaseModalProps) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <ThemedView style={[
          styles.modalContent,
          {
            backgroundColor: Colors[colorScheme].background,
            borderColor: Colors[colorScheme].border,
            borderWidth: 1,
          }
        ]}>
          {children}
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

/**
 * Styles for the BaseModal component
 * 
 * The styles define:
 * - Modal overlay positioning and background
 * - Modal content container styling
 * - Consistent spacing and layout
 */
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 
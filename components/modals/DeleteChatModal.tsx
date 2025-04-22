/**
 * DeleteChatModal Component
 * 
 * A modal for confirming chat deletion that:
 * - Displays the number of chats to be deleted
 * - Provides a warning about the irreversible action
 * - Offers cancel and confirm options
 * - Integrates with the app's theme system
 * 
 * This modal is used when users want to delete one or more chats
 * from their conversation list.
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { BaseModal } from './BaseModal';
import { IconSymbol } from '../ui/IconSymbol';

interface DeleteChatModalProps {
    visible: boolean;        // Controls modal visibility
    onClose: () => void;    // Callback for closing the modal
    onDelete: () => void;   // Callback for confirming deletion
    selectedCount: number;  // Number of chats selected for deletion
}

export function DeleteChatModal({
    visible,
    onClose,
    onDelete,
    selectedCount
}: DeleteChatModalProps) {
    const colorScheme = useColorScheme() ?? 'light';

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
        >
            {/* Modal Header */}
            <View style={[
                styles.modalHeader,
                { borderBottomColor: Colors[colorScheme].icon }
            ]}>
                <View>
                    <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                        Delete Items
                    </ThemedText>
                </View>
                <Pressable
                    style={styles.closeButton}
                    onPress={onClose}
                >
                    <IconSymbol name="xmark" size={20} color={Colors[colorScheme].icon} />
                </Pressable>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
                {/* Confirmation Message */}
                <ThemedText style={styles.message}>
                    Are you sure you want to delete {selectedCount} item{selectedCount > 1 ? 's' : ''}?
                </ThemedText>
                <ThemedText style={styles.warning}>
                    This action cannot be undone.
                </ThemedText>

                {/* Action Buttons */}
                <View style={styles.buttonsContainer}>
                    <Pressable
                        style={[styles.button, styles.cancelButton]}
                        onPress={onClose}
                    >
                        <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                    </Pressable>
                    <Pressable
                        style={[styles.button, styles.deleteButton]}
                        onPress={onDelete}
                    >
                        <ThemedText style={[styles.buttonText, styles.deleteButtonText]}>
                            Delete
                        </ThemedText>
                    </Pressable>
                </View>
            </View>
        </BaseModal>
    );
}

/**
 * Styles for the DeleteChatModal component
 * 
 * The styles define:
 * - Modal header layout and appearance
 * - Message and warning text styling
 * - Button container and button styling
 * - Consistent spacing and margins
 */
const styles = StyleSheet.create({
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    modalTitle: {
        fontSize: 18,
    },
    closeButton: {
        padding: 4,
    },
    modalContent: {
        padding: 16,
    },
    message: {
        fontSize: 16,
        marginBottom: 8,
    },
    warning: {
        fontSize: 14,
        color: '#FF3B30',
        marginBottom: 24,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        fontSize: 16,
    },
    deleteButtonText: {
        color: 'white',
    },
}); 
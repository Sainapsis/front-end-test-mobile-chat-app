import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { BaseModal } from './BaseModal';
import { IconSymbol } from '../ui/IconSymbol';

interface DeleteChatModalProps {
    visible: boolean;
    onClose: () => void;
    onDelete: () => void;
    selectedCount: number;
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
            <View style={[
                styles.modalHeader,
                { borderBottomColor: Colors[colorScheme].icon }
            ]}>
                <View>
                    <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                        Delete Chats
                    </ThemedText>
                </View>
                <Pressable
                    style={styles.closeButton}
                    onPress={onClose}
                >
                    <IconSymbol name="xmark" size={20} color={Colors[colorScheme].icon} />
                </Pressable>
            </View>

            <View style={styles.modalContent}>
                <ThemedText style={styles.message}>
                    Are you sure you want to delete {selectedCount} chat{selectedCount > 1 ? 's' : ''}?
                </ThemedText>
                <ThemedText style={styles.warning}>
                    This action cannot be undone.
                </ThemedText>

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
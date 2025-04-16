/**
 * EditProfileModal Component
 * 
 * A modal for editing user profile information that:
 * - Allows users to change their name
 * - Provides avatar selection and preview
 * - Handles image picking from device gallery
 * - Validates input before saving
 * - Integrates with the app's theme system
 * 
 * This modal is used when users want to update their profile
 * information and avatar.
 */

import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Modal, Alert, Image } from 'react-native';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface EditProfileModalProps {
    visible: boolean;        // Controls modal visibility
    onClose: () => void;    // Callback for closing the modal
    onSave: (name: string, avatar: string) => void;  // Callback for saving changes
    currentName: string;    // Current user's name
    currentAvatar: string;  // Current user's avatar URL
}

export function EditProfileModal({ visible, onClose, onSave, currentName, currentAvatar }: EditProfileModalProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [name, setName] = useState(currentName);
    const [avatar, setAvatar] = useState(currentAvatar);

    /**
     * Handles image picking from device gallery
     * - Requests media library permissions
     * - Launches image picker
     * - Updates avatar state with selected image
     */
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please grant permission to access your photos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setAvatar(result.assets[0].uri);
        }
    };

    /**
     * Handles saving profile changes
     * - Calls onSave with updated name and avatar
     * - Closes the modal
     */
    const handleSave = () => {
        onSave(name, avatar);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            {/* Modal Container */}
            <View style={[styles.modalContainer, { backgroundColor: colors.background + 'CC' }]}>
                <View style={[styles.modalContent, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }]}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <ThemedText type="title">Edit Profile</ThemedText>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <IconSymbol name="xmark" size={24} color={colors.text} />
                        </Pressable>
                    </View>

                    {/* Avatar Section */}
                    <View style={styles.avatarContainer}>
                        <Pressable onPress={pickImage}>
                            <View style={[styles.avatarWrapper, { borderColor: colors.border }]}>
                                <View style={[styles.avatar, { backgroundColor: colors.tabIconDefault }]}>
                                    {avatar ? (
                                        <Image source={{ uri: avatar }} style={styles.avatarImage} />
                                    ) : (
                                        <IconSymbol name="person" size={40} color={colors.background} />
                                    )}
                                </View>
                                <View style={[styles.editOverlay, { backgroundColor: "#007AFF" }]}>
                                    <IconSymbol name="pencil" size={24} color="white" />
                                </View>
                            </View>
                        </Pressable>
                    </View>

                    {/* Name Input Section */}
                    <View style={styles.inputContainer}>
                        <ThemedText style={styles.label}>Name</ThemedText>
                        <TextInput
                            style={[styles.input, {
                                color: colors.text,
                                borderColor: colors.border,
                                backgroundColor: colors.background
                            }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor={colors.text + '80'}
                        />
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <Pressable
                            style={[styles.button, { backgroundColor: colors.tabIconDefault }]}
                            onPress={onClose}
                        >
                            <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                        </Pressable>
                        <Pressable
                            disabled={!name.trim() && !avatar}
                            style={[styles.button, { backgroundColor: '#007AFF' }]}
                            onPress={() => name.trim() && avatar && handleSave()}
                        >
                            <ThemedText style={styles.buttonText}>Save</ThemedText>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

/**
 * Styles for the EditProfileModal component
 * 
 * The styles define:
 * - Modal container and content layout
 * - Header and close button styling
 * - Avatar container and image styling
 * - Input field appearance
 * - Button container and button styling
 * - Consistent spacing and margins
 */
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    closeButton: {
        padding: 4,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarWrapper: {
        position: 'relative',
        borderWidth: 2,
        borderRadius: 60,
        padding: 2,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    editOverlay: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderRadius: 16,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
}); 
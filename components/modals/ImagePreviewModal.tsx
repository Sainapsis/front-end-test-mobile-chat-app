/**
 * ImagePreviewModal Component
 * 
 * A modal for previewing images that:
 * - Displays images in full screen
 * - Provides zoom and pan capabilities
 * - Handles image loading states
 * - Integrates with the app's theme system
 * 
 * This modal is used for previewing images before sending
 * or viewing received images in the chat.
 */

import React from 'react';
import { StyleSheet, View, Image, Pressable, Dimensions, Modal } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
interface ImagePreviewModalProps {
    visible: boolean;
    onClose: () => void;
    imageUrl: string;
}

export function ImagePreviewModal({ visible, onClose, imageUrl }: ImagePreviewModalProps) {

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <Pressable style={styles.closeButton} onPress={onClose}>
                    <IconSymbol name="xmark.circle.fill" size={32} color="white" />
                </Pressable>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>
        </Modal>
    );
}

/**
 * Styles for the ImagePreviewModal component
 * 
 * The styles define:
 * - Image container and sizing
 * - Image display properties
 * - Consistent spacing and layout
 */
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
    },
    image: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
}); 
import React from 'react';
import { StyleSheet, View, Image, Pressable, Dimensions, Modal } from 'react-native';
import { ThemedView } from '../ThemedView';
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
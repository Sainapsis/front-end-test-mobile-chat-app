import React from 'react';
import { Modal, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedView } from '@/components/common/ThemedView';
import { imageViewerStyles } from '@/styles/components/imageViewer.styles';

interface ImageViewerProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

export function ImageViewer({ visible, imageUri, onClose }: ImageViewerProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <ThemedView style={imageViewerStyles.container}>
        <BlurView intensity={100} style={imageViewerStyles.blurContainer}>
          <Pressable style={imageViewerStyles.closeButton} onPress={onClose}>
            <IconSymbol name="close" size={24} color="#FFFFFF" />
          </Pressable>

          <View style={imageViewerStyles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={imageViewerStyles.image}
              contentFit="contain"
              transition={200}
            />
          </View>
        </BlurView>
      </ThemedView>
    </Modal>
  );
}
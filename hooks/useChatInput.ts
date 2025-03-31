import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

/**
 * Custom hook for managing chat input functionality
 * 
 * @param onSendMessage - Callback function to handle message sending
 * @returns Object containing:
 *  - selectedImage: Currently selected image URI
 *  - pickImageAsync: Function to select an image from the device
 *  - handleSend: Function to handle message sending
 *  - removeImage: Function to remove the selected image
 * 
 * @example
 * const { selectedImage, pickImageAsync, handleSend, removeImage } = useChatInput(onSendMessage);
 * 
 * @remarks
 * - Handles image selection using Expo's ImagePicker
 * - Manages the state of the selected image
 * - Provides functions for sending messages and removing images
 * - Clears the selected image after sending
 */
export const useChatInput = (onSendMessage: (imageUri?: string) => void) => {
    const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);

    /**
     * Opens the device's image library for image selection
     * @async
     * @remarks Uses Expo's ImagePicker with default settings
     */
    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    /**
     * Removes the currently selected image
     * @remarks Resets the selectedImage state to undefined
     */
    const removeImage = () => {
        setSelectedImage(undefined);
    };

    /**
     * Handles message sending with optional image
     * @remarks Clears the selected image after sending
     */
    const handleSend = () => {
        if (selectedImage) {
            onSendMessage(selectedImage);
            setSelectedImage(undefined);
        } else {
            onSendMessage();
        }
    };

    return {
        selectedImage,
        pickImageAsync,
        handleSend,
        removeImage
    };
};
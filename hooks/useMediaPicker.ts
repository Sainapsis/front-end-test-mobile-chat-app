import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Media } from '@/interfaces/chatTypes';

interface UseMediaPickerReturn {
  selectedMedia: Media | null;
  setSelectedMedia: (media: Media | null) => void;
  pickImage: () => Promise<void>;
  pickVideo: () => Promise<void>;
  pickFile: () => Promise<void>;
  prepareMedia: (media: Media) => Media;
}

export const useMediaPicker = (): UseMediaPickerReturn => {
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  // prepare media to be sent to the server
  const prepareMedia = useCallback((media: Media) => {
    return {
      ...media,
      name: media.name || `media_${Date.now()}.${media.type}`,
    };
  }, []);

  const verifyVideoAccessibility = useCallback(async (uri: string) => {
    try {
      const videoInfo = await FileSystem.getInfoAsync(uri);
      if (!videoInfo.exists) {
        throw new Error('El archivo de video no existe o no es accesible');
      }
    } catch (error) {
      console.error('Error al verificar el video en iOS:', error);
      throw new Error('No se pudo verificar el archivo de video');
    }
  }, []);

  const compressImage = useCallback(async (asset: ImagePicker.ImagePickerAsset) => {
    const context = ImageManipulator.manipulate(asset.uri);
    const image = await context.resize({ width: 1024 }).renderAsync();
    const result = await image.saveAsync({
      compress: 0.6,
      format: SaveFormat.JPEG,
    });
    return { uri: result.uri, name: asset.fileName || '', size: asset.fileSize };
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 0.7,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      const isLargeImage = asset.fileSize && asset.fileSize > 2 * 1024 * 1024;

      const media = isLargeImage
        ? await compressImage(asset)
        : { uri: asset.uri, name: asset.fileName || '', size: asset.fileSize };

      setSelectedMedia({ type: 'image', ...media });
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Por favor, inténtalo de nuevo.');
    }
  }, [compressImage]);

  const pickVideo = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const video = result.assets[0];
        const fileName = video.fileName || `video_${Date.now()}.mov`;

        if (Platform.OS === 'ios') {
          await verifyVideoAccessibility(video.uri);
        }

        setSelectedMedia({
          type: 'video',
          uri: video.uri,
          name: fileName,
          size: video.fileSize,
        });
      }
    } catch (error) {
      console.error('Error al seleccionar el video:', error);
      Alert.alert('Error', 'No se pudo seleccionar el video. Por favor, inténtalo de nuevo.');
    }
  }, [verifyVideoAccessibility]);

  const pickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedMedia({
          type: 'file',
          uri: asset.uri,
          name: asset.name || 'Archivo',
          size: asset.size,
        });
      }
    } catch (error) {
      console.error('Error al seleccionar el archivo:', error);
    }
  }, []);

  return {
    selectedMedia,
    setSelectedMedia,
    pickImage,
    pickVideo,
    pickFile,
    prepareMedia,
  };
};
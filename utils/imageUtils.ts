import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

export interface ProcessedImage {
  uri: string;
  thumbnailUri: string;
  type: string;
}

export async function pickImage(): Promise<ProcessedImage | null> {
  try {
    // Solicitar permisos
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Se necesitan permisos para acceder a la galería');
      return null;
    }

    // Seleccionar imagen
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      
      // Crear thumbnail
      const thumbnail = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      return {
        uri: imageUri,
        thumbnailUri: thumbnail.uri,
        type: 'image/jpeg'
      };
    }
    return null;
  } catch (error) {
    console.error('Error al seleccionar imagen:', error);
    return null;
  }
}

export async function compressImage(uri: string): Promise<string> {
  try {
    const compressed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return compressed.uri;
  } catch (error) {
    console.error('Error al comprimir imagen:', error);
    return uri;
  }
} 
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAppContext } from '@/hooks/AppContext';
import { VoiceRecordButton } from './VoiceRecordButton';

interface MessageInputProps {
  chatId: string;
}

export function MessageInput({ chatId }: MessageInputProps) {
  const [text, setText] = useState('');
  const { sendMessage, currentUser } = useAppContext();

  const handleSend = async () => {
    if (!text.trim() || !currentUser) return;

    await sendMessage(chatId, text.trim(), currentUser.id);
    setText('');
  };

  const handleVoiceRecordingComplete = async (voiceUri: string, duration: number) => {
    if (!currentUser) return;

    await sendMessage(chatId, '', currentUser.id, undefined, { uri: voiceUri, duration });
  };

  const handleAttachImage = async () => {
    if (!currentUser) return;

    try {
      // Solicitar permiso para acceder a la galería de imágenes
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la galería de imágenes.');
        return;
      }

      // Abrir selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        // Crear una versión reducida para la vista previa
        const preview = await ImageManipulator.manipulateAsync(
          selectedImage.uri,
          [{ resize: { width: 300 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Enviar mensaje con imagen
        await sendMessage(
          chatId,
          text.trim(), // También enviar el texto si hay alguno
          currentUser.id,
          { uri: selectedImage.uri, previewUri: preview.uri }
        );

        // Limpiar el texto después de enviar
        setText('');
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleAttachImage} style={styles.attachButton}>
        <MaterialIcons name="attach-file" size={24} color="#007AFF" />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <VoiceRecordButton onRecordingComplete={handleVoiceRecordingComplete} />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <MaterialIcons name="send" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E1E1E1',
    backgroundColor: '#FFFFFF',
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
  },
  input: {
    fontSize: 16,
    maxHeight: 100,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 
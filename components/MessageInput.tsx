import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, useColorScheme } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Colors } from '@/constants/Colors';
import { useAppContext } from '@/hooks/AppContext';
import { VoiceRecordButton } from './VoiceRecordButton';
import { log, mediumFeedback, selectionFeedback, lightFeedback, successFeedback, errorFeedback } from '@/utils';

interface MessageInputProps {
  chatId: string;
}

export function MessageInput({ chatId }: MessageInputProps) {
  const [text, setText] = useState('');
  const { sendMessage, currentUser } = useAppContext();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const handleSend = async () => {
    if (!text.trim() || !currentUser) return;

    try {
      mediumFeedback(); // Retroalimentación háptica media al enviar un mensaje
      log.debug(`Sending message to chat ${chatId}`);
      await sendMessage(chatId, text.trim(), currentUser.id);
      setText('');
      successFeedback(); // Retroalimentación de éxito al completar el envío
    } catch (error) {
      errorFeedback(); // Retroalimentación de error si falla el envío
      log.error('Failed to send message:', error);
    }
  };

  const handleVoiceRecordingComplete = async (voiceUri: string, duration: number) => {
    if (!currentUser) return;

    try {
      mediumFeedback(); // Retroalimentación háptica al completar grabación
      await sendMessage(chatId, '', currentUser.id, undefined, { uri: voiceUri, duration });
      successFeedback(); // Retroalimentación de éxito al completar el envío
    } catch (error) {
      errorFeedback(); // Retroalimentación de error si falla el envío
      log.error('Failed to send voice message:', error);
    }
  };

  const handleAttachImage = async () => {
    if (!currentUser) return;

    try {
      selectionFeedback(); // Retroalimentación háptica al seleccionar adjuntar imagen
      // Solicitar permiso para acceder a la galería de imágenes
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        errorFeedback(); // Retroalimentación de error si se deniega el permiso
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
        lightFeedback(); // Retroalimentación háptica ligera al seleccionar imagen
        const selectedImage = result.assets[0];

        // Crear una versión reducida para la vista previa
        const preview = await ImageManipulator.manipulateAsync(
          selectedImage.uri,
          [{ resize: { width: 300 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Enviar mensaje con imagen
        mediumFeedback(); // Retroalimentación háptica media al enviar la imagen
        await sendMessage(
          chatId,
          text.trim(), // También enviar el texto si hay alguno
          currentUser.id,
          { uri: selectedImage.uri, previewUri: preview.uri }
        );

        // Limpiar el texto después de enviar
        setText('');
        successFeedback(); // Retroalimentación de éxito al completar el envío
      }
    } catch (error) {
      errorFeedback(); // Retroalimentación de error si falla
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Inténtalo de nuevo.');
    }
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.inputBackground,
        borderTopColor: theme.border
      }
    ]}>
      <TouchableOpacity
        onPress={handleAttachImage}
        style={[
          styles.attachButton,
          { backgroundColor: colorScheme === 'dark' ? 'rgba(109, 152, 217, 0.1)' : 'transparent' }
        ]}
      >
        <MaterialIcons name="attach-file" size={24} color={theme.primary} />
      </TouchableOpacity>

      <View style={[
        styles.inputContainer,
        { backgroundColor: colorScheme === 'dark' ? '#202020' : '#F5F5F5' }
      ]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={text}
          onChangeText={setText}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={theme.tabIconDefault}
          multiline
          maxLength={1000}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <VoiceRecordButton onRecordingComplete={handleVoiceRecordingComplete} />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: text.trim()
                ? theme.buttonBackground
                : colorScheme === 'dark'
                  ? 'rgba(109, 152, 217, 0.3)'
                  : theme.buttonDisabled
            }
          ]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={text.trim() ? theme.buttonText : colorScheme === 'dark' ? '#9EAEC7' : '#999999'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 20,
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
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 
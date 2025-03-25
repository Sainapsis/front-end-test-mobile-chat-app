import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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

  return (
    <View style={styles.container}>
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
        {text.trim() && (
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <MaterialIcons name="send" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
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
    marginRight: 8,
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
}); 
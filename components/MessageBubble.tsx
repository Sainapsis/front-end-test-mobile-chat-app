import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Modal } from 'react-native';
import { Picker } from 'emoji-mart-native';
import { ThemedText } from './ThemedText';
import { Message,useChats  } from '@/hooks/useChats';
import { useColorScheme } from '@/hooks/useColorScheme';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  chatId: string;
}

export function MessageBubble({ message, isCurrentUser, chatId }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); //mostrar emoji
  const { updateMessage } = useChats(null);
  const [localReaction, setLocalReaction] = useState(message.reaction || null);

  React.useEffect(() => {
    setLocalReaction(message.reaction || null);
  }, [message.reaction]);

  const reaction = message.reaction || null;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleEmojiSelect = async (emoji: string) => {
      console.log('Seleccionaste emoji:', emoji);
    await updateMessage(chatId, message.id, { reaction: emoji });
    setLocalReaction(emoji);
    setShowEmojiPicker(false);
  };

  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.selfContainer : styles.otherContainer
    ]}>
      <View style={[
        styles.bubble,
        isCurrentUser 
          ? [styles.selfBubble, { backgroundColor: isDark ? '#235A4A' : '#DCF8C6' }]
          : [styles.otherBubble, { backgroundColor: isDark ? '#2A2C33' : '#FFFFFF' }]
      ]}>
        <ThemedText style={[
          styles.messageText,
          isCurrentUser && !isDark && styles.selfMessageText
        ]}>
          {message.text}
        </ThemedText>

        <View style={styles.timeContainer}>
          <ThemedText style={styles.timeText}>
            {formatTime(message.timestamp)}
          </ThemedText>

          {/* BOTÓN DE REACCIÓN */}
          <Pressable onPress={() => setShowEmojiPicker(true)} style={styles.reactionButton}>
            {localReaction ? (
              <ThemedText style={styles.reactionText}>{localReaction}</ThemedText>
            ) : (
              <ThemedText style={styles.reactionText}> - </ThemedText>
            )}
          </Pressable>
        </View>
      </View>
      {showEmojiPicker && (
          <View style={styles.emojiPickerInline}>
            {['😂', '❤️', '👍', '🔥', '😮'].map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => {
                  handleEmojiSelect(emoji);
                }}
                style={styles.emojiButton}
              >
                <ThemedText style={styles.emojiText}>{emoji}</ThemedText>
              </Pressable>
            ))}
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  selfContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  selfBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  selfMessageText: {
    color: '#000000',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.7,
  },
  reactionButton: {
  marginLeft: 8,
  paddingHorizontal: 2,
  paddingVertical: 2,
  backgroundColor: '#7D7D7D',
  borderRadius: 32,
  },
  reactionText: {
    marginTop: 4,
    fontSize: 18,
    alignSelf: 'flex-start',
  },
  emojiPickerInline: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40, // ajusta según ubicación del mensaje
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 6,
    elevation: 5,
  },

  emojiButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  emojiText: {
    fontSize: 24,
  },

}); 
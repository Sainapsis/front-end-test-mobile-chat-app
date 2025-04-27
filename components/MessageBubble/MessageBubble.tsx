import React, { useState,useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Message  } from '@/hooks/useChats';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MessageOptions } from './MessageOptions';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  chatId: string;
  showEmojiPicker: boolean;
  onOpenEmojiPicker: () => void;
  onCloseEmojiPicker: () => void;
  setMessageText: (text: string) => void;
  setActiveEditMessage: (id: string | null) => void;
  onDeleteMessage: (chatId: string, messageId: string) => Promise<void>;
}

export function MessageBubble({
    message, 
    isCurrentUser,
    chatId, 
    showEmojiPicker, 
    onOpenEmojiPicker, 
    onCloseEmojiPicker, 
    setMessageText, 
    setActiveEditMessage, 
    onDeleteMessage 
  }: MessageBubbleProps) {

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [localReaction, setLocalReaction] = useState(message.reaction || null);
  
  useEffect(() => {
    setLocalReaction(message.reaction || null);
  }, [message.reaction]);

  const handleEmojiSelect = (emoji: string | null) => {
    setLocalReaction(emoji); 
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDeleteMessage = async () => {
    await onDeleteMessage(chatId, message.id);
    onCloseEmojiPicker();
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

          <Pressable onPress={onOpenEmojiPicker} style={styles.reactionButton}>
            {localReaction ? (
              <ThemedText style={styles.reactionText}>{localReaction}</ThemedText>
            ) : (
              <ThemedText style={styles.reactionText}> + </ThemedText>
            )}
          </Pressable>
        </View>
      </View>

      {showEmojiPicker && (
        <View style={[
          styles.optionsWrapper,
          { alignSelf: isCurrentUser ? 'flex-end' : 'flex-start' }
        ]}>
          <MessageOptions
            message={message}
            chatId={chatId}
            currentEmoji={localReaction}
            onCloseEmojiPicker={onCloseEmojiPicker}
            onEmojiSelect={handleEmojiSelect}
          />
        </View>
      )}



    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
    position: 'relative',
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
    width: 27,
    height: 27,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#B8B8B8', // Puedes cambiarlo por el color que quieras
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },

  reactionText: {
    fontSize: 18,
    textAlign: 'center',
    height: 25,
    lineHeight: 25,
  },

  emojiPickerInline: {
    position: 'absolute',
    bottom: -60,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 6,
    elevation: 5,
    zIndex: 10,
    maxWidth: 240,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },


  emojiButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 4,
  },

  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
  },

  actionText: {
    fontSize: 14,
    color: '#333',
  },

  optionsWrapper: {
    position: 'absolute',   // clave
    bottom: -60,            // ajusta según dónde quieras mostrar el menú
    zIndex: 10,
  }
  
  
});

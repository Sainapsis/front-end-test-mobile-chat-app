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

  return (
    <View style={styles.wrapper}>
      {/* Burbuja */}
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
      </View>

      {/* Opciones, totalmente separado */}
      {showEmojiPicker && (
        <View style={[
          styles.optionsWrapperOutside,
          { alignSelf: isCurrentUser ? 'flex-end' : 'flex-start' }
        ]}>
          <MessageOptions
            message={message}
            chatId={chatId}
            currentEmoji={localReaction}
            isCurrentUser={isCurrentUser}
            onCloseEmojiPicker={onCloseEmojiPicker}
            onEmojiSelect={handleEmojiSelect}
            setMessageText={setMessageText}
            setActiveEditMessage={setActiveEditMessage}
            onDeleteMessage={onDeleteMessage}
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
    borderColor: '#B8B8B8',
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

  optionsWrapper: {
    marginTop: 8,
    maxWidth: 260,
    width: 'auto',
    alignItems: 'flex-start',
  },  

  optionsWrapperOutside: {
    marginTop: 4,
    maxWidth: 260,
    alignItems: 'flex-start',
  },
  
  wrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  
});

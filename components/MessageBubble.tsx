import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { Message } from '@/hooks/useChats';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol, IconSymbolName } from './ui/IconSymbol';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onReact?: (messageId: string, emoji: string) => void; // Prop opcional
}

export function MessageBubble({ message, isCurrentUser, onReact }: MessageBubbleProps) {
  const bubbleColor = useThemeColor({}, isCurrentUser ? 'selfBubble' : 'otherBubble');
  const bubbleTextColor = useThemeColor({}, 'bubbleText');
  const iconThemeColor = useThemeColor({}, 'icon');
  const [showReactions, setShowReactions] = useState(false);
  const reactionButtonColor = useThemeColor({}, 'text');

  const EMOJIS = ['👍', '❤️', '😂', '😮', '😢'];
  
  const handleReactionPress = (emoji: string) => {
    if (onReact) { // Verificación explícita
      onReact(message.id, emoji);
    }
    setShowReactions(false);
  };

  const ReactionPicker = () => (
    <View style={[
      styles.reactionPicker,
      isCurrentUser ? styles.reactionPickerRight : styles.reactionPickerLeft
    ]}>
      {EMOJIS.map(emoji => (
        <TouchableOpacity
          key={emoji}
          onPress={() => handleReactionPress(emoji)}
          style={styles.reactionOption}
        >
          <ThemedText style={styles.reactionEmoji}>{emoji}</ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );

  const getStatusIcon = () => {
    if (!isCurrentUser) return null;
    
    let iconName: IconSymbolName = 'checkmark';
    let iconColor = iconThemeColor;
    
    if (message.status === 'delivered') {
      iconName = 'checkmark.diamond';
    } else if (message.status === 'read') {
      iconName = 'eye.fill';
    }
    return (
      <IconSymbol
        name={iconName}
        size={12}
        color={iconColor}
        style={{ marginLeft: 4 }}
      />
    );
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.selfContainer : styles.otherContainer
    ]}>
      <View style={[
        styles.bubble,
        isCurrentUser ? styles.selfBubble : styles.otherBubble,
        { backgroundColor: bubbleColor }
      ]}>
        <ThemedText style={[
          styles.messageText,
          { color: bubbleTextColor }
        ]}>
          {message.text}
        </ThemedText>
        <View style={styles.timeContainer}>
          <ThemedText style={styles.timeText}>
            {formatTime(message.timestamp)}
          </ThemedText>
          {getStatusIcon()}
        </View>
      {/* Reacción actual */}
      {message.reaction && (
          <View style={[
            styles.currentReaction,
            isCurrentUser ? styles.selfReaction : styles.otherReaction
          ]}>
            <ThemedText style={styles.reactionEmoji}>{message.reaction}</ThemedText>
          </View>
        )}
      </View>
    
    {/* Botón de reacción */}
    <TouchableOpacity 
        onPress={() => setShowReactions(!showReactions)}
        style={[
          styles.reactionButton,
          isCurrentUser ? styles.selfReactionButton : styles.otherReactionButton
        ]}
      >
        <ThemedText style={[styles.reactionIcon, { color: reactionButtonColor }]}>
          {message.reaction ? '🔄' : '➕'}
        </ThemedText>
      </TouchableOpacity>

      {/* Selector de reacciones */}
      {showReactions && <ReactionPicker />}
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
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.7,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  statusIcon: {
    marginLeft: 2,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 8,
    maxWidth: '80%',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    alignItems: 'center',
  },
  reactionButton: {
    padding: 6,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  selfReactionButton: {
    marginLeft: 8,
  },
  otherReactionButton: {
    marginRight: 8,
  },
  reactionIcon: {
    fontSize: 16,
  },
  reactionPicker: {
    position: 'absolute',
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 8,
    gap: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1,
  },
  reactionPickerRight: {
    bottom: -40,
    right: 40,
  },
  reactionPickerLeft: {
    bottom: -40,
    left: 40,
  },
  reactionOption: {
    padding: 4,
  },
  reactionEmoji: {
    fontSize: 20,
  },
  currentReaction: {
    position: 'absolute',
    bottom: -8,
    borderRadius: 12,
    padding: 4,
    minWidth: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    elevation: 1,
  },
  selfReaction: {
    right: -8,
  },
  otherReaction: {
    left: -8,
  },
}); 
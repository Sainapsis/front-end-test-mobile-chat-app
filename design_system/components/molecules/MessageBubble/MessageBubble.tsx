import React from 'react';
import { View, TouchableWithoutFeedback, Modal } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms';
import { styles } from './MessageBubble.styles';
import { useMessageBubble } from '@/hooks/components/useMessageBubble';
import { Message } from '@/hooks/useChats';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  userId: string;
  onDeleteMessage?: (messageId: string) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (reactionId: string, messageId: string) => void;
  onEditMessage?: (messageId: string, currentText: string) => void; // Add onEditMessage prop
}

export function MessageBubble({ 
  message, 
  isCurrentUser,
  userId,
  onDeleteMessage,
  onAddReaction,
  onRemoveReaction,
  onEditMessage // Include onEditMessage
}: MessageBubbleProps) {
  const { 
    isDark,
    bubbleColors,
    handleLongPress,
    showEmojiSelector,
    setShowEmojiSelector,
    handleEmojiSelected,
    handleRemoveReaction
  } = useMessageBubble({ 
    message, 
    isCurrentUser,
    userId,
    onDeleteMessage,
    onAddReaction,
    onEditMessage,
    onRemoveReaction 
  });

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <TouchableWithoutFeedback onLongPress={handleLongPress}>
        <View style={[styles.container, isCurrentUser ? styles.selfContainer : styles.otherContainer]}>
          <View style={[
            styles.bubble,
            isCurrentUser ? styles.selfBubble : styles.otherBubble,
            { backgroundColor: bubbleColors.background }
          ]}>
            <ThemedText style={[styles.messageText, isCurrentUser && !isDark && styles.selfMessageText]}>
              {message.text}
            </ThemedText>
            <View style={styles.timeContainer}>
              <ThemedText style={styles.timeText}>
                {formatTime(message.timestamp)}
              </ThemedText>
            </View>
            {message.reactions && message.reactions.length > 0 && (
              <View style={[
                styles.reactionsContainer,
                isCurrentUser ? styles.reactionsRight : styles.reactionsLeft
              ]}>
                {message.reactions.map((reaction) => (
                  <TouchableWithoutFeedback
                    key={reaction.id}
                    onPress={() => handleRemoveReaction(reaction.id)}
                  >
                    <View style={styles.reaction}>
                      <ThemedText style={styles.reactionText}>{reaction.emoji}</ThemedText>
                    </View>
                  </TouchableWithoutFeedback>
                ))}
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>

      <Modal
        visible={showEmojiSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmojiSelector(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowEmojiSelector(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.emojiSelectorContainer}>
              <View style={styles.emojiSelectorHeader}>
                <ThemedText darkColor='#000000'>Select Reaction</ThemedText>
              </View>
              <View style={{ height: 300 }}>
                <EmojiSelector
                  onEmojiSelected={handleEmojiSelected}
                  showSearchBar={false}
                  showHistory={false}
                  showTabs
                  columns={8}
                  category={Categories.emotion}
                  showSectionTitles={false}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

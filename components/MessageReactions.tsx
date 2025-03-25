import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useAppContext } from '../hooks/AppContext';
import { MessageReaction } from '../hooks/useChats';

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface MessageReactionsProps {
  readonly messageId: string;
  readonly reactions: MessageReaction[];
}

export function MessageReactions({ messageId, reactions }: MessageReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { currentUser, addReaction, removeReaction } = useAppContext();

  const handleEmojiPress = async (emoji: string) => {
    if (!currentUser) return;

    const existingReaction = reactions.find(
      r => r.userId === currentUser.id && r.emoji === emoji
    );

    if (existingReaction) {
      await removeReaction(messageId, currentUser.id, emoji);
    } else {
      await addReaction(messageId, currentUser.id, emoji);
    }

    setShowEmojiPicker(false);
  };

  // Group reactions by emoji
  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <View style={styles.container}>
      {/* Existing reactions */}
      <View style={styles.reactionsContainer}>
        {Object.entries(reactionCounts).map(([emoji, count]) => (
          <TouchableOpacity
            key={emoji}
            style={[
              styles.reactionBubble,
              reactions.some(r => r.userId === currentUser?.id && r.emoji === emoji) &&
              styles.selectedReaction,
            ]}
            onPress={() => handleEmojiPress(emoji)}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
            <Text style={styles.countText}>{count}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add reaction button */}
      <TouchableOpacity
        style={styles.addReactionButton}
        onPress={() => setShowEmojiPicker(true)}
      >
        <Text style={styles.addReactionText}>😀</Text>
      </TouchableOpacity>

      {/* Emoji picker modal */}
      <Modal
        visible={showEmojiPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEmojiPicker(false)}
        >
          <View style={styles.emojiPickerContainer}>
            {EMOJI_OPTIONS.map(emoji => (
              <TouchableOpacity
                key={emoji}
                style={styles.emojiOption}
                onPress={() => handleEmojiPress(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
  },
  selectedReaction: {
    backgroundColor: '#e3f2fd',
  },
  emojiText: {
    fontSize: 16,
  },
  countText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#666',
  },
  addReactionButton: {
    padding: 4,
  },
  addReactionText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    maxWidth: '80%',
  },
  emojiOption: {
    padding: 8,
  },
}); 
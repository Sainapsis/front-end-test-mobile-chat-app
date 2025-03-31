import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { useTheme } from '../hooks/theme/useTheme';

interface Reaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: number;
}

interface MessageReactionsProps {
  reactions: Reaction[];
  currentUserId: string;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (reactionId: string) => void;
  isOwnMessage: boolean;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🙏', '👏', '🎉', '🔥'];

export function MessageReactions({
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  isOwnMessage,
}: MessageReactionsProps) {
  const { colors } = useTheme();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        userReacted: false,
        reactionId: reaction.id,
      };
    }
    acc[reaction.emoji].count++;
    if (reaction.userId === currentUserId) {
      acc[reaction.emoji].userReacted = true;
      acc[reaction.emoji].reactionId = reaction.id;
    }
    return acc;
  }, {} as Record<string, { emoji: string; count: number; userReacted: boolean; reactionId: string }>);

  const handleReactionPress = (emoji: string, userReacted: boolean, reactionId: string) => {
    if (userReacted) {
      onRemoveReaction(reactionId);
    } else {
      onAddReaction(emoji);
    }
  };

  return (
    <View style={styles.container}>
      {Object.values(groupedReactions).map(({ emoji, count, userReacted, reactionId }) => (
        <TouchableOpacity
          key={emoji}
          style={[
            styles.reactionBubble,
            {
              backgroundColor: userReacted 
                ? colors.userReactedBackground 
                : isOwnMessage 
                  ? 'rgba(255, 255, 255, 0.2)'
                  : colors.reactionBackground,
            }
          ]}
          onPress={() => handleReactionPress(emoji, userReacted, reactionId)}
        >
          <ThemedText style={styles.emoji}>{emoji}</ThemedText>
          {count > 1 && (
            <ThemedText style={[
              styles.count,
              {
                color: userReacted 
                  ? colors.userReactedText 
                  : isOwnMessage 
                    ? '#FFFFFF'
                    : colors.reactionCount,
              }
            ]}>
              {count}
            </ThemedText>
          )}
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[
          styles.addReactionButton,
          {
            backgroundColor: isOwnMessage 
              ? 'rgba(255, 255, 255, 0.2)'
              : colors.reactionBackground,
          }
        ]}
        onPress={() => setShowEmojiPicker(true)}
      >
        <IconSymbol 
          name="face.smiling" 
          size={16} 
          color={colors.reactionCount}
        />
      </TouchableOpacity>

      <Modal
        visible={showEmojiPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: colors.background }]}
          activeOpacity={1}
          onPress={() => setShowEmojiPicker(false)}
        >
          <ThemedView style={[styles.emojiPicker, { backgroundColor: colors.background }]}>
            {EMOJIS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.emojiOption}
                onPress={() => {
                  onAddReaction(emoji);
                  setShowEmojiPicker(false);
                }}
              >
                <ThemedText style={styles.emojiOptionText}>{emoji}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
    
  },
  emoji: {
    fontSize: 14,
  },
  count: {
    fontSize: 12,
  },
  addReactionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 12,
    padding: 12,
    width: '80%',
    maxWidth: 300,
    justifyContent: 'center',
    gap: 8,
  },
  emojiOption: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiOptionText: {
    fontSize: 24,
  },
}); 
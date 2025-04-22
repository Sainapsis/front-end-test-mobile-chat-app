/**
 * MessageReactions Component
 * 
 * A component that displays and manages reactions on chat messages. It shows a list of reactions
 * with their respective counts and allows users to add new reactions by tapping on existing ones.
 * 
 * Features:
 * - Displays reactions with their counts
 * - Aggregates duplicate reactions
 * - Provides interactive reaction buttons
 * - Supports theme integration
 * - Responsive layout with wrapping
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';

/**
 * Props interface for the MessageReactions component
 * 
 * @property reactions - Record of user IDs to their reactions
 * @property onReactionPress - Callback function when a reaction is pressed
 */
interface MessageReactionsProps {
  reactions: Record<string, string>;
  onReactionPress: (reaction: string) => void;
}

/**
 * MessageReactions Component Implementation
 * 
 * Renders a horizontal list of reactions with their counts:
 * - Aggregates reactions by type and counts occurrences
 * - Displays each reaction with its count
 * - Provides interactive buttons for each reaction
 * - Uses a flexible layout that wraps to multiple lines if needed
 */
export function MessageReactions({ reactions, onReactionPress }: MessageReactionsProps) {
  // Aggregate reactions by type and count occurrences
  const reactionCounts = Object.values(reactions).reduce((acc, reaction) => {
    acc[reaction] = (acc[reaction] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <View style={styles.container}>
      {Object.entries(reactionCounts).map(([reaction, count]) => (
        <Pressable
          key={reaction}
          style={styles.reaction}
          onPress={() => onReactionPress(reaction)}
        >
          <ThemedText style={styles.reactionText}>{reaction}</ThemedText>
          <ThemedText style={styles.count}>{count}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

/**
 * Component styles
 * 
 * Defines the layout and appearance of the reactions:
 * - Container layout with flex wrapping
 * - Reaction button styling
 * - Text styling for reactions and counts
 * - Consistent spacing and padding
 */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 6,
  },
  reactionText: {
    fontSize: 14,
  },
  count: {
    fontSize: 12,
    marginLeft: 2,
    opacity: 0.7,
  },
}); 
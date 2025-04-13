import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';

interface MessageReactionsProps {
  reactions: Record<string, string>;
  onReactionPress: (reaction: string) => void;
}

export function MessageReactions({ reactions, onReactionPress }: MessageReactionsProps) {
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
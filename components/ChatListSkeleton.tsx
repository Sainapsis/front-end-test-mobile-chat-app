/**
 * ChatListSkeleton Component
 * 
 * A loading skeleton component that displays a placeholder for the chat list while data is being loaded.
 * This component provides a visual representation of the chat list structure to improve perceived performance
 * and user experience during loading states.
 * 
 * Features:
 * - Displays 5 placeholder chat items
 * - Mimics the layout of actual chat items
 * - Shows skeleton placeholders for:
 *   - User avatars
 *   - Chat names
 *   - Timestamps
 *   - Message previews
 * - Maintains consistent spacing and layout with the actual chat list
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';

/**
 * ChatListSkeleton Component Implementation
 * 
 * Renders a skeleton loading state that matches the structure of the chat list:
 * - Creates 5 placeholder chat items
 * - Each item contains:
 *   - Circular avatar placeholder
 *   - Two-line content placeholder (name and timestamp)
 *   - Single-line message preview placeholder
 */
export function ChatListSkeleton() {
  return (
    <View style={styles.container}>
      {/* Generate 5 placeholder chat items */}
      {[...Array(5)].map((_, index) => (
        <View key={index} style={styles.chatItem}>
          {/* Avatar placeholder */}
          <Skeleton width={50} height={50} borderRadius={25} />
          <View style={styles.content}>
            {/* Header with name and timestamp placeholders */}
            <View style={styles.header}>
              <Skeleton width={120} height={20} />
              <Skeleton width={60} height={16} />
            </View>
            {/* Message preview placeholder */}
            <View style={styles.message}>
              <Skeleton width={200} height={16} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Component styles
 * 
 * Defines the layout and appearance of the skeleton:
 * - Container layout and padding
 * - Chat item structure and borders
 * - Content spacing and alignment
 * - Header and message layout
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E1E1E1',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  message: {
    marginTop: 4,
  },
}); 
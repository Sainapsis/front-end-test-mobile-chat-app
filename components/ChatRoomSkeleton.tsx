/**
 * ChatRoomSkeleton Component
 * 
 * A loading skeleton component that displays a placeholder for the chat room interface while data is being loaded.
 * This component provides a visual representation of the chat room structure to improve perceived performance
 * and user experience during loading states.
 * 
 * Features:
 * - Displays a header with avatar and name placeholders
 * - Shows 10 alternating message bubbles (left and right aligned)
 * - Includes an input area placeholder
 * - Mimics the actual chat room layout and spacing
 * - Uses random widths for message bubbles to create a more natural look
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';

/**
 * ChatRoomSkeleton Component Implementation
 * 
 * Renders a skeleton loading state that matches the structure of the chat room:
 * - Header section with avatar and name placeholders
 * - Message section with alternating left/right aligned message bubbles
 * - Input section with message input and send button placeholders
 */
export function ChatRoomSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header section with avatar and name */}
      <View style={styles.header}>
        <Skeleton width={32} height={32} borderRadius={16} />
        <Skeleton width={120} height={20} />
      </View>

      {/* Messages section with alternating bubbles */}
      <View style={styles.messages}>
        {[...Array(10)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.message,
              index % 2 === 0 ? styles.messageRight : styles.messageLeft,
            ]}
          >
            {/* Random width message bubble for natural appearance */}
            <Skeleton
              width={Math.random() * 200 + 100}
              height={40}
              borderRadius={20}
            />
          </View>
        ))}
      </View>

      {/* Input section with message input and send button */}
      <View style={styles.inputContainer}>
        <Skeleton width="80%" height={40} borderRadius={20} />
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>
    </View>
  );
}

/**
 * Component styles
 * 
 * Defines the layout and appearance of the skeleton:
 * - Container layout and padding
 * - Header section styling
 * - Message bubbles layout and alignment
 * - Input section styling
 * - Consistent spacing and borders
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  messages: {
    flex: 1,
    padding: 10,
  },
  message: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  messageLeft: {
    alignSelf: 'flex-start',
  },
  messageRight: {
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E1E1E1',
  },
}); 
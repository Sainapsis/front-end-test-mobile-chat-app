/**
 * Avatar Component
 * 
 * A reusable component that displays user avatars with the following features:
 * - Supports both individual and group chat avatars
 * - Displays user's profile picture if available
 * - Falls back to initials with a generated background color if no image is available
 * - Shows online/offline/away status indicators
 * - Customizable size and status visibility
 * - Handles image loading errors gracefully
 */

import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { ThemedText } from './ThemedText';
import { User } from '@/hooks/useUser';
import { IconSymbol } from './ui/IconSymbol';

/**
 * Props interface for the Avatar component
 * 
 * @property user - User object containing user information (optional)
 * @property size - Size of the avatar in pixels (default: 40)
 * @property showStatus - Whether to display the user's online status (default: true)
 * @property isGroup - Whether this avatar represents a group chat (default: false)
 */
interface AvatarProps {
  user?: User;
  size?: number;
  showStatus?: boolean;
  isGroup?: boolean;
}

/**
 * Generates a consistent color based on a string identifier
 * Used to create a unique background color for avatars without images
 * 
 * @param identifier - String used to generate the color (user ID or name)
 * @returns Hex color string
 */
const getAvatarColor = (identifier?: string): string => {
  if (!identifier) return '#C0C0C0';
  
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
};

/**
 * Extracts initials from a user's name
 * 
 * @param name - User's full name
 * @returns String containing the first letter of the first and last name
 */
const getInitials = (name?: string): string => {
  if (!name) return '?';
  
  const parts = name.split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Avatar Component Implementation
 * 
 * Renders a circular avatar with the following features:
 * - For group chats: Displays a group icon
 * - For individual users: Shows profile picture or initials
 * - Handles image loading errors by falling back to initials
 * - Displays online status indicator when enabled
 */
export function Avatar({ user, size = 40, showStatus = true, isGroup = false }: AvatarProps) {
  // State to track image loading errors
  const [avatarError, setAvatarError] = useState(false);
  
  // Generate background color and initials for fallback display
  const backgroundColor = getAvatarColor(user?.id || user?.name);
  const initials = getInitials(user?.name);
  
  // Status indicator colors
  const statusColors = {
    online: '#4CAF50',
    offline: '#9E9E9E',
    away: '#FFC107',
  };

  // Dynamic avatar styling based on size
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
  };

  return (
    <View style={styles.container}>
      {/* Avatar container with dynamic styling */}
      <View style={[styles.avatar, avatarStyle]}>
        {isGroup ? (
          // Group chat avatar with icon
          <IconSymbol name="person.2" size={size * 0.6} color="white" />
        ) : user?.avatar && !avatarError ? (
          // User profile picture
          <Image
            source={{ uri: user.avatar }}
            style={[styles.avatarImage, avatarStyle]}
            onError={() => setAvatarError(true)}
          />
        ) : (
          // Fallback to initials
          <ThemedText style={[
            styles.initials,
            { fontSize: size * 0.4 }
          ]}>
            {initials}
          </ThemedText>
        )}
      </View>

      {/* Status indicator for online/offline/away */}
      {showStatus && user?.status && !isGroup && (
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: statusColors[user.status],
              width: size / 4,
              height: size / 4,
              borderRadius: size / 8,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

/**
 * Component styles
 * 
 * Defines the layout and appearance of the avatar and its components:
 * - Container positioning
 * - Avatar shape and overflow handling
 * - Image styling
 * - Initials text styling
 * - Status indicator positioning and border
 */
const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    resizeMode: 'cover',
  },
  initials: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'white',
  },
}); 
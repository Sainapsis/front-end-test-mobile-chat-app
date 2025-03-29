import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms';
import { styles } from './Avatar.styles';
import { useAvatar } from '@/hooks/components/useAvatar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { themes as Colors } from '@/design_system/ui/tokens';
import { User } from '@/types/User';

interface AvatarProps {
  /** User data for the avatar */
  user?: User;
  /** Size of the avatar in pixels */
  size?: number;
  /** Whether to show the status indicator */
  showStatus?: boolean;
}

/**
 * Avatar component displays a user's initials and optional status indicator.
 * It dynamically adjusts based on the provided size and theme.
 */
export function Avatar({ user, size = 40, showStatus = true }: AvatarProps) {
  const { initials, dynamicStyles } = useAvatar(user, size);
  const theme = useColorScheme() ?? 'light';
  return (
    <View style={styles.container}>
      <View style={[styles.avatar, dynamicStyles.avatarSize]}>
        <ThemedText style={[theme === 'light' ? {color: Colors.light.text.contrast} : {color: Colors.dark.text.contrast}, dynamicStyles.initialsSize]}>
          {initials}
        </ThemedText>
      </View>
      {showStatus && user?.status && (
        <View style={[styles.statusIndicator, dynamicStyles.statusSize]} />
      )}
    </View>
  );
}

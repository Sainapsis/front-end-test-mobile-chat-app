import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms';
import { styles } from './Avatar.styles';
import { useAvatar } from '@/hooks/components/useAvatar';
import { User } from '@/hooks/useUser';

interface AvatarProps {
  user?: User;
  size?: number;
  showStatus?: boolean;
}

export function Avatar({ user, size = 40, showStatus = true }: AvatarProps) {
  const { backgroundColor, initials, dynamicStyles } = useAvatar(user, size);

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, dynamicStyles.avatarSize]}>
        <ThemedText style={[styles.initials, dynamicStyles.initialsSize]}>
          {initials}
        </ThemedText>
      </View>
      {showStatus && user?.status && (
        <View style={[styles.statusIndicator, dynamicStyles.statusSize]} />
      )}
    </View>
  );
}

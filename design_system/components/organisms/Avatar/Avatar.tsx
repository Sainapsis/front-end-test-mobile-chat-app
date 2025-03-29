import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms';
import { styles } from './Avatar.styles';
import { useAvatar } from '@/hooks/components/useAvatar';
import { User } from '@/hooks/useUser';
import { useColorScheme } from '@/hooks/useColorScheme';
import { themes as Colors } from '@/design_system/ui/tokens';

interface AvatarProps {
  user?: User;
  size?: number;
  showStatus?: boolean;
}

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

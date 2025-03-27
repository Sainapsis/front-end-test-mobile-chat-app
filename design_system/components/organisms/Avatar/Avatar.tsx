import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms';
import { User } from '@/hooks/useUser';
import { styles, getAvatarStyles, statusColors } from './Avatar.styles';

interface AvatarProps {
  user?: User;
  size?: number;
  showStatus?: boolean;
}

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

const getInitials = (name?: string): string => {
  if (!name) return '?';
  
  const parts = name.split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export function Avatar({ user, size = 40, showStatus = true }: AvatarProps) {
  const backgroundColor = getAvatarColor(user?.id || user?.name);
  const initials = getInitials(user?.name);
  const dynamicStyles = getAvatarStyles(size, backgroundColor, user?.status);

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

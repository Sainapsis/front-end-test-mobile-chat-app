import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { User } from '@/hooks/useUser';
import { avatarFunc } from '@/utils/helpers/avatar_func';
import { UserStatusColors } from '@/constants/Colors';

interface AvatarProps {
  user?: User;
  size?: number;
  showStatus?: boolean;
}

export function Avatar({ user, size = 40, showStatus = true }: AvatarProps) {
  const backgroundColor = avatarFunc.getAvatarColor(user?.id || user?.name);
  const initials = avatarFunc.getInitials(user?.name);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2, backgroundColor }
        ]}
      >
        <ThemedText style={[
          styles.initials,
          { fontSize: size * 0.4, lineHeight: size * 0.4 },
        ]}>
          {initials}
        </ThemedText>
      </View>
      {showStatus && user?.status && (
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: UserStatusColors[user.status],
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

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 3,
  },
  statusIndicator: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'white',
  },
}); 
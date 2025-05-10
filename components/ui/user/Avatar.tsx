import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { User } from '@/hooks/user/useUser';

interface AvatarProps {
  userName?: string;
  status?: 'online' | 'offline' | 'away';
  size?: number;
  showStatus?: boolean;
}

const getInitials = (name?: string): string => {
  if (!name) return '?';

  const parts = name.split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export function Avatar({ userName, status, size = 40, showStatus = true }: AvatarProps) {
  const initials = getInitials(userName);

  const statusColors = {
    online: '#4CAF50',
    offline: '#9E9E9E',
    away: '#FFC107',
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2 }
        ]}
      >
        <ThemedText style={[
          styles.initials,
          { fontSize: size * 0.4,
            lineHeight: size * 0.5
           }
        ]}>
          {initials}
        </ThemedText>
      </View>
      {showStatus && status && (
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: statusColors[status || 'online'],
              width: size / 4,
              height: size / 4,
              minHeight: 12,
              minWidth: 12,
              borderRadius: size >= 48 ? size / 8 : 6,
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
    backgroundColor: '#F1D6FE'
  },
  initials: {
    color: '#9542B9',
    fontWeight: 500,
  },
  statusIndicator: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'white',
  },
}); 
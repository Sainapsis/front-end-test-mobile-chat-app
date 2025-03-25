import React from 'react';
import { View, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { ThemedText } from './ThemedText';
import { Avatar } from './Avatar';
import { User } from '@/hooks/useUser';
import { Colors } from '@/constants/Colors';

interface UserListItemProps {
  user: User;
  onSelect?: (user: User) => void;
  isSelected?: boolean;
}

export function UserListItem({ user, onSelect, isSelected }: UserListItemProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const handlePress = () => {
    if (onSelect) {
      onSelect(user);
    }
  };

  return (
    <Pressable
      style={[
        styles.container,
        isSelected && [styles.selectedContainer, { backgroundColor: `${theme.primary}20` }],
        { borderBottomColor: theme.border }
      ]}
      onPress={handlePress}
    >
      <Avatar user={user} size={50} />
      <View style={styles.infoContainer}>
        <ThemedText style={styles.nameText}>{user.name}</ThemedText>
        <ThemedText style={[
          styles.statusText,
          {
            color: user.status === 'online'
              ? theme.success
              : user.status === 'away'
                ? theme.warning
                : theme.tabIconDefault
          }
        ]}>
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectedContainer: {
    borderRadius: 8,
  },
  infoContainer: {
    marginLeft: 12,
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    marginTop: 4,
  },
}); 
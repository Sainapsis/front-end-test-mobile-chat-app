import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { Avatar } from './Avatar';
import { User } from '@/hooks/useUser';
import styles from '../styles/UserListItemStyles';

interface UserListItemProps {
  user: User;
  onSelect?: (user: User) => void;
  isSelected?: boolean;
}

export function UserListItem({ user, onSelect, isSelected }: UserListItemProps) {
  const handlePress = () => {
    if (onSelect) {
      onSelect(user);
    }
  };

  return (
    <Pressable 
      style={[styles.container, isSelected && styles.selectedContainer]} 
      onPress={handlePress}
    >
      <Avatar user={user} size={50} />
      <View style={styles.infoContainer}>
        <ThemedText type="defaultSemiBold">{user.name}</ThemedText>
        <ThemedText style={styles.statusText}>
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </ThemedText>
      </View>
    </Pressable>
  );
}
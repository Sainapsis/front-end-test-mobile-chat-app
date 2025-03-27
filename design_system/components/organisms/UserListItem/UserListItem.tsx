import * as React from 'react';
import { View, Pressable } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms';
import { Avatar } from '@/design_system/components/organisms';
import { styles } from './UserListItem.styles';
import { useUserListItem } from '@/hooks/components/useUserListItem';
import { User } from '@/hooks/useUser';

interface UserListItemProps {
  user: User;
  onSelect?: (user: User) => void;
  isSelected?: boolean;
}

export function UserListItem({ user, onSelect, isSelected }: UserListItemProps) {
  const { handlePress } = useUserListItem({ user, onSelect }); 

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
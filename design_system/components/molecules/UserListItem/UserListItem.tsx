import * as React from 'react';
import { View, Pressable } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms/ThemedText';
import { Avatar } from '@/design_system/components/organisms/Avatar';
import { styles as createStyles } from './UserListItem.styles';
import { useUserListItem } from '@/hooks/components/useUserListItem';
import { useTheme } from '@/context/ThemeContext';
import { User } from '@/types/User';

interface UserListItemProps {
  user: User;
  onSelect?: (user: User) => void;
  isSelected?: boolean;
}

export function UserListItem({ user, onSelect, isSelected }: UserListItemProps) {
  const { handlePress } = useUserListItem({ user, onSelect }); 
  const { theme } = useTheme();
  const styles = createStyles(theme);

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
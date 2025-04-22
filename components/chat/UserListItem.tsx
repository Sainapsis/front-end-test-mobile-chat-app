import React from 'react';
import { View, Pressable } from 'react-native';
import { ThemedText } from '@/components/common/ThemedText';
import { Avatar } from '@/components/Avatar';
import { User } from '@/interfaces/chatTypes';
import { useAppContext } from '@/hooks/AppContext';
import { userListItemStyles } from '@/styles/components/userListItemStyles';

interface UserListItemProps {
  user: User;
  onSelect?: (userId: string) => void;
  isSelected?: boolean;
}

export function UserListItem({ user, onSelect, isSelected }: UserListItemProps) {
  const { theme } = useAppContext();
  const handlePress = () => {
    if (onSelect) {
      onSelect(user.id);
    }
  };

  return (
    <Pressable
      style={[
        userListItemStyles.container,
        { borderBottomColor: theme.colors.border },
        isSelected && userListItemStyles.selectedContainer,
      ]}
      onPress={handlePress}
    >
      <Avatar uri={user.avatar} fallback={user.name[0]} size={50} />
      <View style={userListItemStyles.infoContainer}>
        <ThemedText type="defaultSemiBold">{user.name}</ThemedText>
        <ThemedText style={userListItemStyles.statusText}>
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </ThemedText>
      </View>
    </Pressable>
  );
}


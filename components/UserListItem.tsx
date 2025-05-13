import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { TextType, ThemedText } from './ThemedText';
import { Avatar } from './Avatar';
import { ThemeColors } from '@/constants/Colors';
import { transformText } from '@/utils/helpers/text_func';
import { User } from '@/src/domain/entities/user';

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
        <ThemedText type={TextType.DEFAULT_SEMI_BOLD}>{user.name}</ThemedText>
        <ThemedText style={styles.statusText}>
          {transformText.firstLetterUpperCase(user.status)}
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
    borderBottomColor: '#E1E1E1',
  },
  selectedContainer: {
    backgroundColor: '#007aff19',
  },
  infoContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    color: ThemeColors.gray,
    marginTop: 4,
  },
}); 
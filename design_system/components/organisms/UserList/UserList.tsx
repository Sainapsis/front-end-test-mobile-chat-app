import React from 'react';
import { FlatList } from 'react-native';
import { UserListItem } from '@/design_system/components/molecules/UserListItem';
import { styles } from './UserList.styles';
import { User } from '@/types/User';

interface UserListProps {
  /** Array of users to display in the list */
  users: User[];
  /** Function to be called when a user is selected */
  onUserSelect: (userId: string) => void;
}

/**
 * UserList component displays a scrollable list of users.
 * Each user is represented by a UserListItem component.
 */
export const UserList: React.FC<UserListProps> = ({ users, onUserSelect }) => (
  <FlatList
    data={users}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <UserListItem
        user={item}
        onSelect={() => onUserSelect(item.id)}
      />
    )}
    contentContainerStyle={styles.listContainer}
  />
);
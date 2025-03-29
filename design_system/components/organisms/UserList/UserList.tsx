import React from 'react';
import { FlatList } from 'react-native';
import { UserListItem } from '@/design_system/components/molecules';
import { styles } from './UserList.styles';
import { User } from '@/hooks/useUser';

interface UserListProps {
  users: User[];
  onUserSelect: (userId: string) => void;
}

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
import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { UserListItem } from '@/design_system/components/organisms';
import { LoginTemplate } from '@/design_system/components/templates';

export default function LoginScreen() {
  const { users, login } = useAppContext();
  const router = useRouter();

  const handleUserSelect = async (userId: string) => {
    if (await login(userId)) {
      router.replace('/(tabs)');
    }
  };

  return (
    <LoginTemplate
      title="Welcome to Chat App"
      subtitle="Select a user to continue"
    >
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserListItem
            user={item}
            onSelect={() => handleUserSelect(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />
    </LoginTemplate>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
});
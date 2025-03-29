import React from 'react';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { LoginTemplate } from '@/design_system/components/templates';
import { UserList } from '@/design_system/components/organisms/UserList';

/**
 * Login screen component that handles user authentication
 */
export default function LoginScreen() {
  const { users, login } = useAppContext();
  const router = useRouter();

  /**
   * Handles user selection and login process
   * @param userId - ID of the selected user
   */
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
      <UserList 
        users={users}
        onUserSelect={handleUserSelect}
      />
    </LoginTemplate>
  );
}
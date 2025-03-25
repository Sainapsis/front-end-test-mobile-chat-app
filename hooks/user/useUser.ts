import { useUserDb, User } from '@/hooks/db/useUserDb';

export { User };

export function useUser() {
  const { 
    users, 
    currentUser, 
    login, 
    logout, 
    isLoggedIn,
    loading 
  } = useUserDb();

  return {
    users,
    currentUser,
    login,
    logout,
    isLoggedIn,
    loading,
  };
} 
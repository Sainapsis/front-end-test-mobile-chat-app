import { useUserDb } from './db/useUserDb';
import { User } from '@/database/interface/user';

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
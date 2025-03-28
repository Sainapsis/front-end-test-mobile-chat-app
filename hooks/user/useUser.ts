import { useUserDb, User } from '@/hooks/db/useUserDb';

export { User };

export function useUser() {
  const { 
    users, 
    currentUser, 
    login, 
    logout, 
    isLoggedIn,
    loading,
    registerUser,
    getPublicProfileData,
    profiles
  } = useUserDb();

  return {
    users,
    currentUser,
    login,
    logout,
    isLoggedIn,
    loading,
    registerUser,
    getPublicProfileData,
    profiles
  };
} 
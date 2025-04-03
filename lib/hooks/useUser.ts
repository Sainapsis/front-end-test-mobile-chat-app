import { useUserDb } from "./db/useUserDb";

export function useUser() {
  const { users, currentUser, login, logout, isLoggedIn, loading } =
    useUserDb();

  return {
    users,
    currentUser,
    login,
    logout,
    isLoggedIn,
    loading,
  };
}

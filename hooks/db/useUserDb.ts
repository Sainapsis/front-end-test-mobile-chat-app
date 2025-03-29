import { useState, useEffect, useCallback } from 'react';
import { db } from '@/database/db';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { User } from '@/types/User';

/**
 * Custom hook for managing user-related database operations
 * @returns Object containing user data and authentication methods
 */
export function useUserDb() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      console.error("Database is not initialized.");
      setLoading(false);
      return;
    }

    const loadUsers = async () => {
      try {
        const usersData = await db.select().from(users);


        if (!usersData || usersData.length === 0) {
          throw new Error('No data returned from the database');
        }

        setAllUsers(usersData as User[]);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  /**
   * Logs in a user by their ID
   * @param userId - ID of the user to log in
   * @returns Boolean indicating success
   */
  const login = useCallback(async (userId: string) => {
    try {
      if (!db) {
        console.error("Database is not initialized.");
        return false;
      }

      const user = await db.select().from(users).where(eq(users.id, userId));


      if (!user || user.length === 0) {
        console.error('No user found with the given ID');
        return false;
      }

      const { id, name, avatar, status } = user[0];
      if (!id || !name || !avatar || !status) {
        console.error('User data is missing required properties');
        return false;
      }

      setCurrentUser(user[0] as User);
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  }, []);

  /**
   * Logs out the current user
   */
  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return {
    users: allUsers,
    currentUser,
    login,
    logout,
    isLoggedIn: !!currentUser,
    loading,
  };
}

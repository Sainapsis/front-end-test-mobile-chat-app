import { useState, useEffect, useCallback } from 'react';
import { db } from '../../database/db';
import { users } from '../../database/schema';
import { eq } from 'drizzle-orm';

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

export function useUserDb() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Validar que `db` esté disponible antes de usarlo
  useEffect(() => {
    if (!db) {
      console.error("Database is not initialized.");
      setLoading(false);
      return;
    }

    const loadUsers = async () => {
      try {
        const usersData = await db.select().from(users);
        console.log('Users data:', usersData);

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

  const login = useCallback(async (userId: string) => {
    try {
      if (!db) {
        console.error("Database is not initialized.");
        return false;
      }

      const user = await db.select().from(users).where(eq(users.id, userId));
      console.log('User data:', user); // Log the data returned from the database

      if (!user || user.length === 0) {
        console.error('No user found with the given ID');
        return false;
      }

      // Ensure user[0] has the expected properties
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

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/providers/database/db';
import { users } from '@/providers/database/schema';
import { eq } from 'drizzle-orm';
import * as SecureStore from 'expo-secure-store';

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

  // Check if there is a current session
  useEffect(() => {
    const checkSession = async () => {
      const sessionId = await SecureStore.getItemAsync('userSession');
      if (sessionId && !currentUser) {
        try {
          // Call Login only if there is a session
          await login(JSON.parse(sessionId));
        } catch (error) {
          console.error('Error during login', error);
        } finally {
          setLoading(false);
        }
      } else {
        // If there is no session, users will be loaded
        try {
          const usersData = await db.select().from(users);
          setAllUsers(usersData);
        } catch (error) {
          console.error('Error loading users:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkSession();
  }, []);

  // Effect to load users
  useEffect(() => {
    const loadAllUsers = async () => {
      try {
        const usersData = await db.select().from(users);
        setAllUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    // If current user exists, all users will be loaded 
    if (currentUser) {
      loadAllUsers();
    }
  }, [currentUser]);

  const login = useCallback(async (userId: string) => {
    try {
      const user = await db.select().from(users).where(eq(users.id, userId));
      // At login, userSession will be updated
      if (user && user.length > 0) {
        setCurrentUser(user[0]);
        await SecureStore.setItemAsync('userSession', JSON.stringify(userId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    setCurrentUser(null);
    await SecureStore.deleteItemAsync('userSession');
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
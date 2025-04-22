import { useState, useEffect, useCallback } from 'react';
import { db } from '../../database/db';
import { users } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { useDatabaseStatus } from '../../database/DatabaseProvider';
import { User } from '@/interfaces/chatTypes';


export function useUserDb() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isInitialized, error } = useDatabaseStatus();

  // Load all users from the database
  useEffect(() => {
    console.log('useUserDb effect triggered, isInitialized:', isInitialized);
    
    if (!isInitialized) {
      console.log('Database not initialized yet, waiting...');
      return;
    }

    const loadUsers = async () => {
      console.log('Starting to load users...');
      try {
        const usersData = await db.select().from(users);
        setAllUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [isInitialized]);
  
  const login = useCallback(async (userId: string) => {
    if (!isInitialized) {
      console.error('Database not initialized');
      return false;
    }

    try {
      const user = await db.select().from(users).where(eq(users.id, userId));
      
      if (user && user.length > 0) {
        console.log('User found:', user[0]);
        setCurrentUser(user[0]);
        return true;
      }
      console.log('User not found for id:', userId);
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  }, [isInitialized]);

  const logout = useCallback(() => {
    console.log('Logging out user');
    setCurrentUser(null);
  }, []);

  const isLoggedIn = !!currentUser;

  return {
    users: allUsers,
    currentUser,
    login,
    logout,
    isLoggedIn,
    loading: loading || !isInitialized,
  };
} 
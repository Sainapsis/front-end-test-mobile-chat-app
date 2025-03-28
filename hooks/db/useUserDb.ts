import { useState, useEffect, useCallback } from 'react';
import { db } from '@/providers/database/db';
import { users } from '@/providers/database/schema';
import { eq } from 'drizzle-orm';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApi } from '@/hooks/api/useApi';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  status: 'online' | 'offline' | 'away';
}

export function useUserDb() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { post, get } = useApi();

  // Check if there is a current session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          const currentUserName = await AsyncStorage.getItem('username')
          const localUserData = await db.select().from(users).where(eq(users.username, currentUserName || ''))
          if (localUserData && localUserData.length === 0) {
            const remoteUserData = await get('/user/userProfileData')
            const userDataToStore = {
              username: remoteUserData.username,
              id: remoteUserData._id,
              name: `${remoteUserData.firstName} ${remoteUserData.lastName}`,
              avatar: remoteUserData.avatar || undefined,
              status: remoteUserData.status,
            }

            await db.insert(users).values(userDataToStore);
            setCurrentUser(userDataToStore)
          } else {
            setCurrentUser(localUserData[0] as User)
          }
          setIsLoggedIn(true)
        }
        const usersData = await db.select().from(users)
        setAllUsers(usersData as User[])
      } catch (err) {
        console.error('Error loading users:', err);
      }
      finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Effect to load users
  useEffect(() => {
    const loadAllUsers = async () => {
      try {
        // let userList = await get('/user/publicProfiles')
        // const usersData = await db.select().from(users);
        // setAllUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    // If current user exists, all users will be loaded 
    if (currentUser) {
      loadAllUsers();
    }
  }, [currentUser]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      //const user = await db.select().from(users).where(eq(users.id, userId));
      const loginData = await post('/auth/login', { username, password });
      if (loginData && loginData['access_token']) {
        await SecureStore.setItemAsync('token', loginData['access_token']);
        await AsyncStorage.setItem('username', username);
        const localUserData = await db.select().from(users).where(eq(users.username, username));
        if (localUserData && localUserData.length === 0) {
          const remoteUserData = await get('/user/userProfileData')

          const userDataToStore = {
            username: remoteUserData.username,
            id: remoteUserData._id,
            name: `${remoteUserData.firstName} ${remoteUserData.lastName}`,
            avatar: remoteUserData.avatar || undefined,
            status: remoteUserData.status,
          }

          await db.insert(users).values(userDataToStore);
          setCurrentUser(userDataToStore)
        } else {
          setCurrentUser(localUserData[0] as User)
        }
        setIsLoggedIn(true)
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setCurrentUser(null);
      await SecureStore.deleteItemAsync('token');
      await AsyncStorage.removeItem('username')
      setIsLoggedIn(false)
      const usersData = await db.select().from(users)
      setAllUsers(usersData as User[])
      console.log(usersData)
    } catch (error) {
      console.error('Error during logout:', error);
    }

  }, []);

  return {
    users: allUsers,
    currentUser,
    login,
    logout,
    isLoggedIn,
    loading,
  };
} 
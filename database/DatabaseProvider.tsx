import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { initializeDatabase } from './db';
import { seedDatabase } from './seed';
import { db } from './db';
import { messages, chats, chatParticipants, users } from './schema';
import styles from '@/styles/DatabaseProviderStyles';

interface DatabaseContextType {
  isInitialized: boolean;
  error: Error | null;
  resetDatabase: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isInitialized: false,
  error: null,
  resetDatabase: async () => {},
});

export const useDatabaseStatus = () => useContext(DatabaseContext);

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const resetDatabase = async () => {
    try {
      setLoading(true);
      // First, delete all data from all tables
      await db.delete(messages);
      await db.delete(chatParticipants);
      await db.delete(chats);
      await db.delete(users);
      
      // Then reinitialize and seed
      await initializeDatabase();
      await seedDatabase();
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown database error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function setupDatabase() {
      try {
        console.log('Initializing database...');
        // Initialize the database schema
        await initializeDatabase();
        console.log('Database initialized');
        
        // Seed the database with initial data
        await seedDatabase();
        console.log('Database seeded');
        
        if (isMounted) {
          setIsInitialized(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('Database initialization error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown database error'));
          setLoading(false);
        }
      }
    }
    
    setupDatabase();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Initializing database...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Database Error:</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={{ isInitialized, error, resetDatabase }}>
      {children}
    </DatabaseContext.Provider>
  );
}
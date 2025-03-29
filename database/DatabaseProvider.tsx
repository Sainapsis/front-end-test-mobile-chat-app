import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { dropTables, initializeDatabase } from './db';
import { seedDatabase } from './seed';

/**
 * Interface representing the database context state
 */
interface DatabaseContextType {
  isInitialized: boolean;
  error: Error | null;
}

/**
 * Context for managing database initialization state
 */
const DatabaseContext = createContext<DatabaseContextType>({
  isInitialized: false,
  error: null,
});

/**
 * Hook for accessing database status
 * @returns Database context containing initialization state and error
 */
export const useDatabaseStatus = () => useContext(DatabaseContext);

/**
 * Props for DatabaseProvider component
 */
interface DatabaseProviderProps {
  children: ReactNode;
}

/**
 * Provider component that handles database initialization and provides context
 * @param children - Child components to be wrapped by the provider
 */
export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function setupDatabase() {
      try {
        console.log('Initializing database...');
        // Initialize the database schema
        //await dropTables();

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
    <DatabaseContext.Provider value={{ isInitialized, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
  },
});
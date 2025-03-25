import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { initializeDatabase } from './db';
import { seedDatabase } from './seed';
import * as FileSystem from 'expo-file-system';

interface DatabaseContextType {
  isInitialized: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isInitialized: false,
  error: null,
});

export const useDatabaseStatus = () => useContext(DatabaseContext);

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function setupDatabase() {
      try {
        // Delete existing database file if it exists
        const dbPath = `${FileSystem.documentDirectory}chat-app.db`;
        const dbJournalPath = `${FileSystem.documentDirectory}chat-app.db-journal`;
        console.log('Checking database at:', dbPath);
        
        // Delete main database file
        const dbExists = await FileSystem.getInfoAsync(dbPath);
        if (dbExists.exists) {
          console.log('Found existing database, deleting...');
          try {
            await FileSystem.deleteAsync(dbPath, { idempotent: true });
            // Also delete journal file if it exists
            const journalExists = await FileSystem.getInfoAsync(dbJournalPath);
            if (journalExists.exists) {
              await FileSystem.deleteAsync(dbJournalPath, { idempotent: true });
            }
            console.log('Database files deleted successfully');
          } catch (deleteError) {
            console.error('Error deleting database:', deleteError);
          }
          
          // Verify deletion
          const dbStillExists = await FileSystem.getInfoAsync(dbPath);
          if (dbStillExists.exists) {
            throw new Error('Failed to delete existing database');
          }
        }

        // Increased delay to ensure file system operations complete
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('Initializing new database...');
        await initializeDatabase();
        console.log('Database initialized');
        
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
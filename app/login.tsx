/**
 * LoginScreen Component
 * 
 * This component implements the login interface where users can:
 * - View a list of available users
 * - Select a user to log in
 * - Navigate to the main app after successful login
 * 
 * The component handles user authentication and provides
 * a simple interface for user selection.
 */

import React, { useEffect } from 'react';
import { StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { UserListItem } from '@/components/UserListItem';

export default function LoginScreen() {
  // Context and hooks initialization
  const { users, login, loading, loadUsers } = useAppContext();
  const router = useRouter();

  /**
   * Load available users when component mounts
   */
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /**
   * Handle user selection and login
   * @param userId - ID of the selected user
   */
  const handleUserSelect = async (userId: string) => {
    const success = await login(userId);
    if (success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <ThemedView style={styles.container}>
        {/* Header Section */}
        <ThemedView style={styles.header}>
          <ThemedText type="title">Welcome to Chat App</ThemedText>
          <ThemedText style={styles.subtitle}>
            Select a user to continue
          </ThemedText>
        </ThemedView>

        {/* User List Section */}
        {loading ? (
          <ThemedText>Loading...</ThemedText>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <UserListItem
                user={item}
                onSelect={() => handleUserSelect(item.id)}
              />
            )}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

/**
 * Styles for the LoginScreen component
 * 
 * The styles are organized into sections:
 * - Layout and container styles
 * - Header styles
 * - List styles
 */
const styles = StyleSheet.create({
  // Layout and container styles
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },

  // Header styles
  header: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: '#8F8F8F',
  },

  // List styles
  listContainer: {
    paddingBottom: 20,
  },
}); 
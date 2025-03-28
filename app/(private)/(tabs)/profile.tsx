import React from 'react';
import { StyleSheet, SafeAreaView, useColorScheme } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { Avatar } from '@/components/ui/user/Avatar';
import { ThemedButton } from '@/components/ui/buttons/ThemedButton';

export default function ProfileScreen() {
  // Get current user data and logout function from global context
  const { currentUser, logout, offline } = useAppContext();
  // Get router to perform navigation actions
  const colorScheme = useColorScheme();

  // Handler for logging out
  const handleLogout = () => {
    logout();
  };

  // If there is no current user, show a loading indicator
  if (!currentUser) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading user profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    // SafeAreaView to ensure content does not overlap system UI elements
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#FFF' }]}>
      <ThemedView style={styles.container}>
        {/* Profile header with avatar and user info */}
        <ThemedView style={styles.profileHeader}>
          <Avatar userName={currentUser.name} size={100} status={currentUser.status} />
          <ThemedView style={styles.profileInfo}>
            {/* Display the user's name */}
            <ThemedText type="title">{currentUser.name}</ThemedText>
            {/* Capitalize the status text (e.g., Online, Offline, Away) */}
            <ThemedText style={styles.statusText}>
              {currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Section displaying additional account information */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Account Information</ThemedText>

          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Username:</ThemedText>
            <ThemedText>{currentUser.username}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Full Name:</ThemedText>
            <ThemedText>{currentUser.name}</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Logout button placed at the bottom of the screen */}
        <ThemedView style={styles.buttonContainer}>
          <ThemedButton onPress={handleLogout} buttonText="Logout" iconName="chevron.right" disabled={offline} />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  statusText: {
    fontSize: 16,
    color: '#8F8F8F',
    marginTop: 4,
  },
  section: {
    padding: 20,
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginRight: 10,
    width: 100,
  },
  buttonContainer: {
    justifyContent: 'flex-end',
    height: 80,
  },
  // Additional styles for logout button if needed (currently ThemedButton handles its own styles)
  logoutButton: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  logoutText: {
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

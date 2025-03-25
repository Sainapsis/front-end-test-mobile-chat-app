import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { Avatar } from '@/components/ui/user/Avatar';
import { ThemedButton } from '@/components/ui/buttons/ThemedButton';

export default function ProfileScreen() {
  // Get current user data and logout function from global context
  const { currentUser, logout } = useAppContext();
  // Get router to perform navigation actions
  const router = useRouter();

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
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Profile header with avatar and user info */}
        <ThemedView style={styles.profileHeader}>
          <Avatar user={currentUser} size={100} />
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
            <ThemedText style={styles.infoLabel}>ID:</ThemedText>
            <ThemedText>{currentUser.id}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Full Name:</ThemedText>
            <ThemedText>{currentUser.name}</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Logout button placed at the bottom of the screen */}
        <ThemedView style={styles.buttonContainer}>
          <ThemedButton onPress={handleLogout} buttonText="Logout" iconName="chevron.right" />
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
    paddingTop: 60,
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
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 80, // Ensures the button is visible above the tab bar
  },
  // Additional styles for logout button if needed (currently ThemedButton handles its own styles)
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
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

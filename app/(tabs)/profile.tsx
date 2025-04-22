import React from 'react';
import { Pressable, SafeAreaView } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { Avatar } from '@/components/Avatar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { profileScreenStyles } from '@/styles/screens/profileScreen.styles';

export default function ProfileScreen() {
  const { currentUser, logout } = useAppContext();

  const handleLogout = () => {
    logout();
    // The navigation to login will be handled by the useProtectedRoute hook in _layout.tsx
  };

  if (!currentUser) {
    return (
      <ThemedView style={profileScreenStyles.loadingContainer}>
        <ThemedText>Loading user profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={profileScreenStyles.safeArea}>
      <ThemedView style={profileScreenStyles.container}>
        <ThemedView style={profileScreenStyles.profileHeader}>
          <Avatar uri={currentUser.avatar} fallback={currentUser.name[0]} size={100} />
          <ThemedView style={profileScreenStyles.profileInfo}>
            <ThemedText type="title">{currentUser.name}</ThemedText>
            <ThemedText style={profileScreenStyles.statusText}>
              {currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={profileScreenStyles.section}>
          <ThemedText type="subtitle">Account Information</ThemedText>
          <ThemedView style={profileScreenStyles.infoRow}>
            <ThemedText style={profileScreenStyles.infoLabel}>ID:</ThemedText>
            <ThemedText>{currentUser.id}</ThemedText>
          </ThemedView>

          <ThemedView style={profileScreenStyles.infoRow}>
            <ThemedText style={profileScreenStyles.infoLabel}>Full Name:</ThemedText>
            <ThemedText>{currentUser.name}</ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedView style={profileScreenStyles.buttonContainer}>
          <Pressable style={profileScreenStyles.logoutButton} onPress={handleLogout}>
            <IconSymbol name="log-out" size={20} color="#FFFFFF" />
            <ThemedText style={profileScreenStyles.logoutText}>Log Out</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}


import React from 'react';
import { Pressable, SafeAreaView } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { TextType, ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Avatar } from '@/components/Avatar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { transformText } from '@/utils/helpers/text_func';
import styles from '@/styles/profile.style';

export default function ProfileScreen() {
  const { currentUser, logout } = useAppContext();

  const handleLogout = () => {
    logout();
  };

  if (!currentUser) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading user profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.profileHeader}>

          <Avatar user={currentUser} size={100} />

          <ThemedView style={styles.profileInfo}>
            <ThemedText type={TextType.TITLE}>{currentUser.name}</ThemedText>

            <ThemedText style={styles.statusText}>
              {transformText.firstLetterUpperCase(currentUser.status)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.section}>
          <ThemedText type={TextType.SUBTITLE} style={styles.textCenter}>Account Information</ThemedText>
          
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>ID:</ThemedText>
            <ThemedText style={styles.detailLabel}>{currentUser.id}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Full Name:</ThemedText>
            <ThemedText style={styles.detailLabel}>{currentUser.name}</ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.buttonContainer}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <IconSymbol name="arrow.right.square" size={20} color="#FFFFFF" />
            <ThemedText style={styles.logoutText}>Log Out</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

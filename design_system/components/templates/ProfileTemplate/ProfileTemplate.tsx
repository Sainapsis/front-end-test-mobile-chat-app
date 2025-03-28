import React from 'react';
import { Pressable, SafeAreaView } from 'react-native';
import { ThemedText, ThemedView } from '@/design_system/components/atoms';
import { SkeletonLoader, EmptyState } from '@/design_system/components/molecules';
import { Avatar } from '@/design_system/components/organisms';
import { IconSymbol } from '@/design_system/ui/vendors';
import { styles } from './ProfileTemplate.styles';

interface ProfileTemplateProps {
  loading?: boolean;
  user?: {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'away';
  };
  onLogout: () => void;
}

export const ProfileTemplate: React.FC<ProfileTemplateProps> = ({
  loading,
  user,
  onLogout,
}) => {
  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <SkeletonLoader width={100} height={100} style={styles.skeletonAvatar} />
        <SkeletonLoader width="60%" height={20} style={styles.skeletonText} />
        <SkeletonLoader width="40%" height={20} style={styles.skeletonText} />
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <EmptyState
        icon="person.crop.circle.badge.exclamationmark"
        title="No Profile Found"
        message="We couldn't load your profile. Please try again later."
        color="#FF3B30"
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.profileHeader}>
          <Avatar user={user} size={100} />
          <ThemedView style={styles.profileInfo}>
            <ThemedText type="title">{user.name}</ThemedText>
            <ThemedText style={styles.statusText}>
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Account Information</ThemedText>

          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>ID:</ThemedText>
            <ThemedText>{user.id}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Full Name:</ThemedText>
            <ThemedText>{user.name}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <Pressable style={styles.logoutButton} onPress={onLogout}>
            <IconSymbol name="arrow.right.square" size={20} color="#FFFFFF" />
            <ThemedText style={styles.logoutText}>Log Out</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

export default ProfileTemplate;
import React, { useState } from 'react';
import { StyleSheet, Pressable, SafeAreaView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Avatar } from '@/components/Avatar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ImagePreviewModal } from '@/components/modals/ImagePreviewModal';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { useChatsDb } from '@/hooks/db/useChatsDb';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function ProfileScreen() {
  const { currentUser, logout } = useAppContext();
  const { updateUserProfile } = useChatsDb(currentUser?.id || null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async (name: string, avatar: string) => {
    if (!currentUser) return;

    const success = await updateUserProfile(currentUser.id, {
      name,
      avatar,
    });

    if (success) {
      currentUser.name = name;
      currentUser.avatar = avatar;
    }
  };

  if (!currentUser) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading user profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.container}>
        <View style={styles.profileHeader}>
          <Pressable
            onPress={() => setShowImagePreview(true)}
            style={styles.avatarContainer}
          >
            <Avatar user={currentUser} size={120} />
          </Pressable>
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <ThemedText type="title" style={styles.nameText}>{currentUser.name}</ThemedText>
              <Pressable onPress={handleEdit} style={styles.editIcon}>
                <IconSymbol name="pencil" size={20} color={colors.tint} />
              </Pressable>
            </View>
            <ThemedText style={styles.statusText}>
              {currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)}
            </ThemedText>
          </View>
        </View>
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
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.logoutButton, { backgroundColor: '#FF3B30' }]}
            onPress={handleLogout}
          >
            <IconSymbol name="arrow.right.square" size={20} color="#FFFFFF" />
            <ThemedText style={styles.buttonText}>Log Out</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
      <ImagePreviewModal
        visible={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        imageUrl={currentUser.avatar || ''}
      />
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
        currentName={currentUser.name}
        currentAvatar={currentUser.avatar || ''}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 40,
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  editIcon: {
    padding: 4,
  },
  statusText: {
    fontSize: 16,
    opacity: 0.7,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
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
});

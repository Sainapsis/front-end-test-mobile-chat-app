import React from 'react';
import { SafeAreaView } from 'react-native';
import { Button, ThemedText, ThemedView } from '@/design_system/components/atoms';
import { SkeletonLoader, EmptyState } from '@/design_system/components/molecules';
import { Avatar } from '@/design_system/components/organisms';
import { IconSymbol } from '@/design_system/ui/vendors';
import { useTheme } from '@/context/ThemeContext';
import { styles } from './ProfileTemplate.styles';
import { themes as Colors } from '@/design_system/ui/tokens/colors';

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
    const { theme, toggleTheme } = useTheme();

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
        <ThemedView style={styles.safeArea}>
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
                    <ThemedText type="subtitle">Preferences</ThemedText>

                    <Button
                        style={[
                            styles.themeButton,
                            { backgroundColor: theme === 'light' ? Colors.light.icon.default : Colors.dark.icon.default },

                        ]}
                          onPress={toggleTheme}
                        variant="secondary"
                        leftIcon={
                            <IconSymbol
                                name={theme === 'light' ? 'moon' : 'sink.fill'}
                                size={20}
                                color={theme != 'light' ? Colors.light.text.primary : Colors.dark.text.primary}
                            />
                        }
                    >
                        <ThemedText style={[{color: theme != 'light' ? Colors.light.text.primary : Colors.dark.text.primary}]}>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</ThemedText>
                    </Button>
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
                    <Button style={styles.logoutButton} onPress={onLogout}>
                        <IconSymbol name="arrow.right.square" size={20} color={theme === 'light' ? Colors.light.text.primary : Colors.dark.text.primary}
                        />
                        <ThemedText style={styles.logoutText}>Log Out</ThemedText>
                    </Button>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );
};

export default ProfileTemplate;
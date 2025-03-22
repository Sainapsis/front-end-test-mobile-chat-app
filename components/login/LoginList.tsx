import React from 'react';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { FlatList, StyleSheet} from 'react-native';
import { UserListItem } from '@/components/users/UserListItem';
import { useAppContext } from '@/hooks/AppContext';
import { useRouter } from 'expo-router';

export default function LoginList() {
    const { users, login } = useAppContext();
    const router = useRouter();
    const handleUserSelect = async (userId: string) => {
        if (await login(userId)) {
            router.replace('/(private)/(tabs)');
        }
    };
    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Welcome to Chat App</ThemedText>
                <ThemedText style={styles.subtitle}>
                    Select a user to continue
                </ThemedText>
            </ThemedView>

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
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
      },
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
      listContainer: {
        paddingBottom: 20,
      },
})
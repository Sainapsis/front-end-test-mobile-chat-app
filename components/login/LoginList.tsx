import React from 'react';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { FlatList, StyleSheet } from 'react-native';
import { UserListItem } from '@/components/users/UserListItem';
import { useAppContext } from '@/hooks/AppContext';
import { useRouter } from 'expo-router';

export default function LoginList() {
    const { users, login } = useAppContext();
    const router = useRouter();
    const handleUserSelect = async (userId: string) => {
        // if (await login(userId)) {
        //     router.replace('/(private)/(tabs)');
        // }
    };
    return (
        <>
            <ThemedText style={styles.subtitle}>
                Select a user to continue
            </ThemedText>
            <ThemedView style={styles.container}>
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
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#8F8F8F',
        textAlign: 'center',
    },
    listContainer: {
        paddingBottom: 20,
    },
})
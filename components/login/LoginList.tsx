import React from 'react';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { Dimensions, FlatList, StyleSheet } from 'react-native';
import { UserListItem } from '@/components/users/UserListItem';
import { useAppContext } from '@/hooks/AppContext';
import { useRouter } from 'expo-router';
import { ThemedButton } from '../ui/buttons/ThemedButton';

interface LoginProps {
    handleSwitchProfile: () => void;
}

const windowWidth = Dimensions.get('window').width;
export default function LoginList({ handleSwitchProfile }: LoginProps) {
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
                            showStatus={false}
                        />
                    )}
                    contentContainerStyle={styles.listContainer}
                />
            </ThemedView>
            <ThemedButton onPress={handleSwitchProfile} buttonText='Use another account' style={styles.switchAccountButton} type="secondary"></ThemedButton>
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
    switchAccountButton: {
        marginTop: 10,
        marginHorizontal: 30,
        position: 'absolute',
        bottom: 10,
        width: windowWidth - 60,
    },
})
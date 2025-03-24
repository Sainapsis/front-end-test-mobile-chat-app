import React, { useState } from 'react';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { useRouter } from 'expo-router';
import { ThemedInput } from '@/components/ui/inputs/ThemedInput';
import { ThemedButton } from '../ui/buttons/ThemedButton';

export default function LoginList() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { users, login } = useAppContext();
    const router = useRouter();
    const handleUserSelect = async (userId: string) => {
        if (await login(userId)) {
            router.replace('/(private)/(tabs)');
        }
    };
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
            <ThemedView style={styles.container}>
                <ThemedInput textValue={username} setTextValue={setUsername} placeholder='Username' label="Username" textArea={false} autoCorrect={false}></ThemedInput>
                <ThemedInput textValue={password} setTextValue={setPassword} placeholder='Password' label="Password" textArea={false} autoCorrect={false}></ThemedInput>
                <ThemedButton onPress={()=>{}} buttonText='Continue' style={styles.loginButton}></ThemedButton>
            </ThemedView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    loginButton: {
        marginTop: 20
    },
    container: {
        paddingHorizontal: 10

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
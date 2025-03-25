import React, { useEffect, useState } from 'react';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { useRouter } from 'expo-router';
import { ThemedInput } from '@/components/ui/inputs/ThemedInput';
import { ThemedButton } from '../ui/buttons/ThemedButton';
import { Avatar } from '../ui/user/Avatar';

export default function LoginProfile() {
    const [password, setPassword] = useState('');
    const [disabled, setDisabled] = useState(true);
    const { users, login } = useAppContext();

    const router = useRouter();

    const handleLogin = async () => {
        let didLogin = await login(users[0].username, password)
        if (didLogin) {
            router.replace('/(private)/(tabs)');
        }
    };

    useEffect(() => {
        setDisabled(password.length < 3);
    }, [password])
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
            <ThemedView style={styles.container}>
                <ThemedInput textValue={password} setTextValue={setPassword} placeholder='Password' label="Password" textArea={false} autoCorrect={false} autoCapitalize={false} isPassword={true}></ThemedInput>
                <ThemedButton onPress={handleLogin} buttonText='Continue' style={styles.loginButton} disabled={disabled}></ThemedButton>
            </ThemedView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    loginButton: {
        marginTop: 20
    },
    container: {
        paddingHorizontal: 20,
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
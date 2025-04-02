import React, { useEffect, useState } from 'react';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/hooks/AppContext';
import { Stack, useRouter } from 'expo-router';
import { ThemedInput } from '@/components/ui/inputs/ThemedInput';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { useColorScheme } from '@/hooks/themes/useColorScheme.web';
import { IconSymbol } from '@/components/ui/icons/IconSymbol';
import { ThemedButton } from '@/components/ui/buttons/ThemedButton';
import { Colors } from '@/components/ui/themes/Colors';

interface Errors {
    name?: string;
    lastName?: string;
    username?: string;
    password?: string;
    passwordConfirm?: string;
}
export default function Register() {
    const {login, registerUser} = useAppContext();
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [errors, setErrors] = useState<Errors>({});
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const validateName = (name: string) => name.trim().length > 0;
    const validateUsername = (username: string) => username.length >= 3 && !/\s/.test(username);
    const validatePassword = (password : string) =>
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[\W_]/.test(password);

    const handleRegister = async () => {
        const newErrors: Errors = {};

        if (!validateName(name)) newErrors.name = 'Name cannot be empty';
        if (!validateName(lastName)) newErrors.lastName = 'Last name cannot be empty';
        if (!validateUsername(username)) newErrors.username = 'Username must be at least 3 characters long and contain no spaces';
        if (!validatePassword(password)) newErrors.password = 'Password must be at least 8 characters long, including one uppercase letter, one lowercase letter, one number, and one special character';
        if (password !== passwordConfirm) newErrors.passwordConfirm = 'Passwords do not match';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // No errors, proceed with registration
        setErrors({});
        await registerUser({
            firstName: name,
            lastName: lastName,
            username: username,
            password: password
        })
        await login(username, password)
        router.replace('/(private)/(tabs)');
    };

    useEffect(() => {
        setDisabled(password.length < 3);
    }, [password])
    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
            <StatusBar style="auto" />
            <Stack.Screen
                options={{
                    headerTitle: () => (
                        <View style={styles.headerContainer}>
                            <ThemedText type="defaultSemiBold" numberOfLines={1}>
                            </ThemedText>
                        </View>
                    ),
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()}>
                            <IconSymbol name="chevron.left" size={24} color="#007AFF" />
                        </Pressable>
                    ),
                }}
            />
            <ScrollView
                keyboardDismissMode="interactive"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}>
                <ThemedView style={styles.formContainer}>
                    <ThemedText style={styles.formTitle}>Account Information</ThemedText>
                    <View style={styles.nameContainer}>
                        <ThemedInput textValue={name} setTextValue={setName} placeholder='Name' label="Name" textArea={false} style={styles.nameInput}></ThemedInput>
                        <ThemedInput textValue={lastName} setTextValue={setLastName} placeholder='Last Name' label="Last Name" textArea={false} style={styles.nameInput}></ThemedInput>
                    </View>
                    {errors.name && <ThemedText style={styles.errorText}>{errors.name}</ThemedText>}
                    {errors.lastName && <ThemedText style={styles.errorText}>{errors.lastName}</ThemedText>}
                    <ThemedInput textValue={username} setTextValue={setUsername} placeholder='Username' label="Your username" textArea={false} autoCorrect={false} autoCapitalize={false}></ThemedInput>
                    {errors.username && <ThemedText style={styles.errorText}>{errors.username}</ThemedText>}
                    <ThemedText style={styles.formTitle}>Security</ThemedText>
                    <ThemedInput textValue={password} setTextValue={setPassword} placeholder='Password' label="Create a password" textArea={false} autoCorrect={false} autoCapitalize={false} isPassword={true}></ThemedInput>
                    {errors.password && <ThemedText style={styles.errorText}>{errors.password}</ThemedText>}
                    <ThemedInput textValue={passwordConfirm} setTextValue={setPasswordConfirm} placeholder='Confirm your Password' label="Confirm your password" textArea={false} autoCorrect={false} autoCapitalize={false} isPassword={true}></ThemedInput>
                    {errors.passwordConfirm && <ThemedText style={styles.errorText}>{errors.passwordConfirm}</ThemedText>}
                    <ThemedButton buttonText={'Create account'} onPress={handleRegister} style={styles.createAccountButton}></ThemedButton>
                </ThemedView>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    errorText: {
        color: 'red',
        marginLeft: 10,
        fontSize: 12,
        lineHeight: 14
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#fff'
    },
    scrollContent: {
        paddingBottom: 100
    },
    container: {
        flex: 1,
    },
    nameContainer: {
        flexDirection: 'row',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    formContainer: {
        padding: 10,
        flex: 1,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 700,
        marginTop: 30,
        marginLeft: 10,
    },
    nameInput: {
        flex: 1,
        height: 100
    },
    createAccountButton: {
        marginTop: 15
    }
}); 
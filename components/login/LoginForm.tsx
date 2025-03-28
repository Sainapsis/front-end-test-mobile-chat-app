import React, { useEffect, useState } from 'react';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { Dimensions, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { useNavigation, useRouter } from 'expo-router';
import { ThemedInput } from '@/components/ui/inputs/ThemedInput';
import { ThemedButton } from '../ui/buttons/ThemedButton';

const windowWidth = Dimensions.get('window').width;
export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [disabled, setDisabled] = useState(true);
    const { users, login } = useAppContext();
    const navigation = useNavigation();
    const router = useRouter();
    const [loginError, setLoginError] = useState<string>()

    const handleLogin = async () => {
        try {
            let didLogin = await login(username, password)
            console.log(didLogin)
            if (didLogin) {
                router.replace('/(private)/(tabs)');
            }else{
                setLoginError('Invalid username and/or password')
            }
        } catch (err) {
            setLoginError('Invalid username and/or password')
        }
    };

    const goToRegister = () => {
        navigation.navigate('/(public)/register' as never);
    }

    useEffect(() => {
        setDisabled(username.length < 3 || password.length < 3)
    }, [username, password])

    return (
        <>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                <ThemedView style={styles.container}>
                    <ThemedInput textValue={username} setTextValue={setUsername} placeholder='Username' label="Username" textArea={false} autoCorrect={false} autoCapitalize={false}></ThemedInput>
                    <ThemedInput textValue={password} setTextValue={setPassword} placeholder='Password' label="Password" textArea={false} autoCorrect={false} autoCapitalize={false} isPassword={true}></ThemedInput>
                    <ThemedButton onPress={handleLogin} buttonText='Continue' style={styles.loginButton} disabled={disabled}></ThemedButton>
                </ThemedView>
                {loginError && <ThemedText style={styles.errorText}>{loginError}</ThemedText>}

            </KeyboardAvoidingView>
            <ThemedButton onPress={() => router.push('/(public)/register')} buttonText='Create Account' style={styles.createAccountButton} type="secondary"></ThemedButton>
        </>

    )
}

const styles = StyleSheet.create({
    errorText: {
        color: 'red',
        marginLeft: 10,
        fontSize: 12,
        lineHeight: 14
    },
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
    createAccountButton: {
        marginTop: 10,
        marginHorizontal: 30,
        position: 'absolute',
        bottom: 10,
        width: windowWidth - 60,
    },
})
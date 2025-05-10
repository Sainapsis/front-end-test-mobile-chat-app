import { Stack } from 'expo-router';
export default function PublicLayout() {
    return (
        <Stack>
            <Stack.Screen name="login" options={{ headerShown: false, gestureEnabled: false, animation: 'none' }} />
            <Stack.Screen name="register" options={{ headerShown: true, gestureEnabled: false, animation: 'none' }} />
        </Stack>
    )
}
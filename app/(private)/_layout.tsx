import { ProtectedRoute } from '@/components/navigation/ProtectedRoute';
import { Stack } from 'expo-router';
export default function ProtectedLayout() {
    return (
        <ProtectedRoute>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="chat-room" options={{ headerShown: true }} />
            </Stack>
        </ProtectedRoute>
    )
}
import { ProtectedRoute } from '@/components/navigation/ProtectedRoute';
import { Stack } from 'expo-router';
export default function ProtectedLayout() {
    return (
        <ProtectedRoute>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="ChatRoom"
                    options={{ headerShown: true }}
                />
            </Stack>
        </ProtectedRoute>
    )
}
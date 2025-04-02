import { ProtectedRoute } from '@/components/navigation/ProtectedRoute';
import { Stack } from 'expo-router';

// ProtectedLayout wraps the protected screens with authentication logic
export default function ProtectedLayout() {
  return (
      <ProtectedRoute>
        {/* Stack navigator for the protected screens */}
        <Stack screenOptions={{ headerShown: false }}>
          {/* 
          The "(tabs)" screen represents the tab navigation group.
          Even though the folder is named "(tabs)", it won't appear in the URL.
          The header is hidden for this screen.
        */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* 
          The "chat-room" screen is a protected route that shows the chat room.
          The header is enabled for this screen to display a title or navigation controls.
        */}
          <Stack.Screen name="chat-room" options={{ headerShown: true }} />
        </Stack>
      </ProtectedRoute>
  );
}

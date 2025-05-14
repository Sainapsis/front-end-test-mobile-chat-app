import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { DrizzleStudioDevTool } from '@/src/infrastructure/DrizzleStudio';
import { Routes } from '@/src/presentation/constants/Routes';
import { useChat } from '@/src/presentation/hooks/useChat';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { useColorScheme } from 'react-native';
import { AppProvider, useAppContext } from '@/src/presentation/hooks/AppContext';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { currentUser, isLoggedIn } = useAppContext();
  const { loading } = useChat({ currentUserId: currentUser?.id || null });

  useAuth({ isLoggedIn, loading });
  
  return (
    <>
      <Stack>
        <Stack.Screen name={Routes.TABS} options={{ headerShown: false }} />
        <Stack.Screen 
          name={Routes.LOGIN} 
          options={{ headerShown: false, gestureEnabled: false, animation: 'fade_from_bottom' }} 
        />
        <Stack.Screen 
          name={Routes.CHATROOM} 
          options={{ headerShown: true, animation: 'fade_from_bottom', gestureEnabled: false }} 
        />
        <Stack.Screen name={Routes.NOTFOUND} />
      </Stack>
      {__DEV__ && <DrizzleStudioDevTool />}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppProvider>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </AppProvider>
    </ThemeProvider>
  );
}

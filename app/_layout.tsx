import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useSegments, useRouter, RelativePathString } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AppProvider, useAppContext } from '@/hooks/AppContext';
import { DrizzleStudioDevTool } from '@/database/DrizzleStudio';
import { Routes } from '@/constants/Routes';

SplashScreen.preventAutoHideAsync();

function useProtectedRoute(isLoggedIn: boolean, loading: boolean) {
  const segments = useSegments();
  const router = useRouter();
  
  useEffect(() => {
    if (loading) return;
    
    const inAuthGroup = segments[0] === 'login';
    
    if (!isLoggedIn && !inAuthGroup) {
      router.replace(`/${Routes.LOGIN}` as RelativePathString);
    } else if (isLoggedIn && inAuthGroup) {
      router.replace(`/${Routes.TABS}` as RelativePathString);
    }
  }, [isLoggedIn, segments, loading]);
}

function RootLayoutNav() {
  const { isLoggedIn, loading } = useAppContext();

  // Call the hook unconditionally
  useProtectedRoute(isLoggedIn, loading);

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

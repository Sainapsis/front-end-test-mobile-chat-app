import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/themes/useColorScheme';
import { AppProvider, useAppContext } from '@/hooks/AppContext';
import { DrizzleStudioDevTool } from '@/providers/database/DrizzleStudio';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoggedIn, loading } = useAppContext();
  return (
    <GestureHandlerRootView>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(public)" options={{ headerShown: false }} />
        <Stack.Screen name="(private)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {loading && (
        <ThemedView style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </ThemedView>
      )}
      {__DEV__ && <DrizzleStudioDevTool />}
    </GestureHandlerRootView>
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

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
}); 

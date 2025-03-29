import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AppProvider } from '@/context/AppContext';
import { AppInitializer } from '@/components/providers/AppInitializer';
import { RootNavigation } from '@/components/navigation/RootNavigation';
import { commonStyles } from '@/design_system/ui/styles';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={commonStyles.container}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppProvider>
          <AppInitializer>
            <RootNavigation />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </AppInitializer>
        </AppProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

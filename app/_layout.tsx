import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/context/ThemeContext';
import { useTheme } from '@/context/ThemeContext';
import { commonStyles } from '@/design_system/ui/styles';
import { AppProvider } from '@/context/AppContext';
import { AppInitializer } from '@/components/providers/AppInitializer';
import { RootNavigation } from '@/components/navigation/RootNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

/**
 * Root layout component that wraps the entire application with necessary providers
 * and sets up the navigation theme and status bar
 */
export default function RootLayout() {
  const { theme } = useTheme();

  return (
    <ThemeProvider>
      <View style={commonStyles.container}>
        <GestureHandlerRootView style={commonStyles.gestureContainer}>
          <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
            <AppProvider>
              <AppInitializer>
                <RootNavigation />
                <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
              </AppInitializer>
            </AppProvider>
          </NavigationThemeProvider>
        </GestureHandlerRootView>
      </View>
    </ThemeProvider>
  );
}

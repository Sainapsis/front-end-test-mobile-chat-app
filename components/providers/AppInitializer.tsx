import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

/**
 * Props for AppInitializer component
 */
interface AppInitializerProps {
  children: React.ReactNode;
}

/**
 * Component that handles app initialization tasks like loading fonts
 * and managing the splash screen
 */
export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <>{children}</>;
};
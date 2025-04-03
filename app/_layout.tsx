import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useSegments, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AppProvider, useAppContext } from '@/hooks/AppContext';
import { DrizzleStudioDevTool } from '@/database/DrizzleStudio';
import { ErrorBoundary, initMonitoring, log, trackNavigation } from '@/utils';
import { Colors } from '@/constants/Colors';

SplashScreen.preventAutoHideAsync();

// Función para proteger rutas basado en autenticación
function useProtectedRoute(isLoggedIn: boolean, loading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Verificar si estamos en la pantalla de login
    const isLoginRoute = segments[0] === 'login';

    if (!isLoggedIn && !isLoginRoute) {
      // Redirigir a la pantalla de login si no está autenticado
      router.replace('/login');
    } else if (isLoggedIn && isLoginRoute) {
      // Redirigir a la pantalla principal si está autenticado y trata de acceder al login
      router.replace('/');
    }
  }, [isLoggedIn, loading, segments, router]);
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Inicializar el sistema de monitoreo al cargar la aplicación
  useEffect(() => {
    const setupMonitoring = async () => {
      try {
        await initMonitoring();
        log.info('Application started');
      } catch (error) {
        console.error('Failed to initialize monitoring:', error);
      }
    };

    setupMonitoring();
  }, []);

  // Manejar errores de carga de fuentes
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AppProvider>
        <RootLayoutNav />
      </AppProvider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoggedIn, loading, dbInitialized } = useAppContext();

  // Personalizar los temas de navegación para que coincidan con nuestros colores
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.dark.background,
      card: Colors.dark.card,
      text: Colors.dark.text,
      border: Colors.dark.border,
      primary: Colors.dark.primary,
    },
  };

  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.light.background,
      card: Colors.light.card,
      text: Colors.light.text,
      border: Colors.light.border,
      primary: Colors.light.primary,
    },
  };

  // Protección de rutas basada en autenticación
  useProtectedRoute(isLoggedIn, loading);

  // Seguimiento de la navegación
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    // Registrar cada cambio de ruta en el sistema de monitoreo
    if (pathname) {
      trackNavigation(pathname);
    }
  }, [pathname, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? customDarkTheme : customLightTheme}>
      <Stack screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? Colors.dark.headerBackground : Colors.light.headerBackground,
        },
        headerTintColor: colorScheme === 'dark' ? Colors.dark.headerText : Colors.light.headerText,
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
        }
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="ChatRoom"
          options={{
            presentation: 'modal',
            title: 'Chat',
            headerBackTitle: 'Volver',
            animation: 'slide_from_right'
          }}
        />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {__DEV__ && dbInitialized && <DrizzleStudioDevTool />}
    </ThemeProvider>
  );
}

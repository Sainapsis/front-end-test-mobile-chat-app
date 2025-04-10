// @ts-nocheck
import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useSegments, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { AppRegistry, AppState, AppStateStatus, Platform, NativeEventEmitter, NativeModules } from 'react-native';

// Import BackgroundDBHandler from our local module
import { BackgroundDBHandler } from '../modules/custom-bg-tasks/build';

import { setupNotifeeBackgroundHandler, sendSilentNotification } from '../modules/custom-notifier/src/notifee-integration';
import { setupFirebaseBackgroundHandler, sendSilentFirebaseMessage } from '../modules/custom-notifier/src/firebase-integration';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AppProvider, useAppContext } from '@/hooks/AppContext';
import { DrizzleStudioDevTool } from '@/database/DrizzleStudio';

SplashScreen.preventAutoHideAsync();

const updateUserInBackground = async (userId: string | undefined) => {
  if (!userId) return false;
  
  try {
    const updatedUser = {
      id: userId,
      modificationDate: new Date().toLocaleString(),
    };
    console.log('🧠 Actualización de usuario en background:', updatedUser);
    return true;
  } catch (error) {
    console.error('Error actualizando usuario en background:', error);
    return false;
  }
};

// Registrar el manejador de mensajes en background para Firebase
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Silent push recibida en background:', remoteMessage);
  const userId = remoteMessage.data?.userId as string;
  if (userId) {
    await updateUserInBackground(userId);
  }
});

// Registrar el manejador de eventos en background para Notifee
AppRegistry.registerHeadlessTask('NotifeeBackgroundEvent', () => {
  return async () => {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.DELIVERED) {
        const { notification } = detail;
        if (notification?.data?.silent) {
          const userId = notification.data?.userId as string;
          if (userId) {
            await updateUserInBackground(userId);
          }
        }
      }
    });
  };
});

const setupNotifications = async () => {
  try {
    // Try to initialize the background module handlers
    let bgHandlerInitialized = false;
    
    try {
      // Inicializar el módulo de background
      bgHandlerInitialized = await BackgroundDBHandler.initialize();
      if (bgHandlerInitialized) {
        const handlerRegistered = await BackgroundDBHandler.registerBackgroundHandler();
        console.log('Background handler registration:', handlerRegistered ? 'successful' : 'failed');
      } else {
        console.log('BackgroundDBHandler initialization failed, some features may not work');
      }
    } catch (bgError) {
      console.error('Error initializing BackgroundDBHandler:', bgError);
    }
    
    // Continue with other notification setup even if background handler failed
    try {
      // Configurar los manejadores de notifee y Firebase
      await setupNotifeeBackgroundHandler();
      await setupFirebaseBackgroundHandler();
    } catch (handlerError) {
      console.error('Error setting up notification handlers:', handlerError);
    }
    
    // Configurar permisos de Firebase
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          await messaging().registerDeviceForRemoteMessages();
        }
      } else {
        await messaging().registerDeviceForRemoteMessages();
      }
    } catch (permissionsError) {
      console.error('Error configuring Firebase permissions:', permissionsError);
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up notifications:', error);
    return false;
  }
};

function useProtectedRoute(isLoggedIn: boolean, loading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;
    
    const inAuthGroup = segments[0] === 'login';
    
    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/login');
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, segments, loading]);
}

function RootLayoutNav() {
  const { isLoggedIn, loading } = useAppContext();
  const router = useRouter();

  useProtectedRoute(isLoggedIn, loading);

  React.useEffect(() => {
    // Configurar el listener de eventos para tareas en background
    let backgroundTaskListener: any = null;
    
    try {
      // Check if the native module exists, otherwise use our JavaScript implementation
      const bgHandlerModule = NativeModules.BackgroundDBHandler || { 
        addListener: () => ({ remove: () => {} }),
        backgroundTask: () => console.log('Mock background task') 
      };
      
      const eventEmitter = new NativeEventEmitter(bgHandlerModule);
      backgroundTaskListener = eventEmitter.addListener('backgroundTask', async (task: { type: string; data?: { userId?: string } }) => {
        console.log('Tarea en background recibida:', task);
        
        if (task.type === 'firebase' && task.data?.userId) {
          await updateUserInBackground(task.data.userId);
        } else if (task.type === 'notifee' && task.data?.userId) {
          await updateUserInBackground(task.data.userId);
        }
      });
      
      if (!NativeModules.BackgroundDBHandler) {
        console.log('BackgroundDBHandler native module is not available, using JavaScript implementation');
      }
    } catch (error) {
      console.error('Error setting up background task listener:', error);
    }
    
    // Configurar el listener de mensajes de Firebase en primer plano
    let unsubscribeForeground: (() => void) | undefined;
    let unsubscribeOpenedApp: (() => void) | undefined;
    let unsubscribeNotifee: (() => void) | undefined;
    let appStateSubscription: any;
    
    try {
      unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
        if (remoteMessage.data?.silent === 'true') {
          const userId = remoteMessage.data?.userId as string;
          if (userId) {
            await updateUserInBackground(userId);
          }
          return;
        }
        
        await notifee.displayNotification({
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
          data: remoteMessage.data,
        });
      });
      
      // Configurar el listener de notificaciones abiertas
      unsubscribeOpenedApp = messaging().onNotificationOpenedApp((remoteMessage) => {
        if (remoteMessage.data?.route) {
          const route = remoteMessage.data.route as string;
          if (route.startsWith('/')) {
            router.push(route as any);
          }
        }
      });
      
      // Verificar si la app fue abierta desde una notificación
      messaging().getInitialNotification().then((remoteMessage) => {
        if (remoteMessage?.data?.route) {
          const route = remoteMessage.data.route as string;
          if (route.startsWith('/')) {
            router.push(route as any);
          }
        }
      });
      
      // Configurar el listener de eventos de notifee
      unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS && detail.notification?.data?.route) {
          const route = detail.notification.data.route as string;
          if (route.startsWith('/')) {
            router.push(route as any);
          }
        }
      });
      
      // Configurar el listener de cambios de estado de la app
      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          // La app está activa, puedes realizar acciones aquí
        }
      };
      
      appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    } catch (error) {
      console.error('Error setting up notification listeners:', error);
    }
    
    return () => {
      // Cleanup listeners
      if (backgroundTaskListener) {
        backgroundTaskListener.remove();
      }
      
      if (unsubscribeForeground) {
        unsubscribeForeground();
      }
      
      if (unsubscribeOpenedApp) {
        unsubscribeOpenedApp();
      }
      
      if (unsubscribeNotifee) {
        unsubscribeNotifee();
      }
      
      if (appStateSubscription) {
        appStateSubscription.remove();
      }
    };
  }, [isLoggedIn]);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="login" 
          options={{ headerShown: false, gestureEnabled: false }} 
        />
        <Stack.Screen 
          name="ChatRoom" 
          options={{ headerShown: true }} 
        />
        <Stack.Screen name="+not-found" />
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

  React.useEffect(() => {
    const initialize = async () => {
      if (loaded) {
        await SplashScreen.hideAsync();
        await setupNotifications();
      }
    };
    initialize();
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
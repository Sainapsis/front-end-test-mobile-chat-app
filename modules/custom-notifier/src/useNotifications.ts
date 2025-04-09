import * as React from 'react';
import CustomNotifierModule from './CustomNotifierModule';
import { 
    NotificationReceivedEvent, 
    NotificationOpenedEvent, 
    TokenRefreshEvent 
} from './CustomNotifier.types';
import { Platform, AppState, AppStateStatus } from 'react-native';

const DEBUG_TAG = '[CustomNotifier]';

// Define handler types based on the new event types
type NotificationReceivedHandler = (event: NotificationReceivedEvent) => void;
type NotificationOpenedHandler = (event: NotificationOpenedEvent) => void;
type TokenRefreshHandler = (event: TokenRefreshEvent) => void;

interface ExpoSubscription {
  remove: () => void;
}

export const useNotifications = () => {
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);
  const [fcmToken, setFcmToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Refs for the listeners
  const notificationReceivedListener = React.useRef<ExpoSubscription | null>(null);
  const notificationOpenedListener = React.useRef<ExpoSubscription | null>(null);
  const tokenRefreshedListener = React.useRef<ExpoSubscription | null>(null);

  // --- Permission Check --- 
  const checkPermissions = React.useCallback(async (showLoading = false) => {
    console.log(DEBUG_TAG, 'Checking notification permissions...');
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const granted = await CustomNotifierModule.checkPermissions();
      console.log(DEBUG_TAG, 'Permission check result:', granted);
      setHasPermission(granted);
      return granted;
    } catch (e: any) {
      const errorMessage = e?.message || 'Error checking permissions';
      console.error(DEBUG_TAG, 'Error checking permissions:', e);
      setError(errorMessage);
      setHasPermission(false);
      return false;
    } finally {
       if (showLoading) setIsLoading(false);
    }
  }, []);

  // --- Permission Request --- 
  const requestPermissions = React.useCallback(async () => {
    console.log(DEBUG_TAG, 'Requesting notification permissions...');
    setIsLoading(true);
    setError(null);
    try {
      const requested = await CustomNotifierModule.requestPermissions();
      console.log(DEBUG_TAG, 'Permission request initiated, result indicates if dialog shown (Android) or granted status (iOS):', requested);

      if (Platform.OS === 'android' && !requested) {
         console.log(DEBUG_TAG, 'Android: Waiting for user interaction or app focus to recheck permission.');
      } else {
         const currentStatus = await checkPermissions();
         setHasPermission(currentStatus);
         console.log(DEBUG_TAG, `Permission status after request: ${currentStatus}`);
         return currentStatus;
      }
      return requested;
    } catch (e: any) {
      const errorMessage = e?.message || 'Error requesting permissions';
      console.error(DEBUG_TAG, 'Error requesting permissions:', e);
      setError(errorMessage);
      setHasPermission(false);
      return false;
    } finally {
      if (Platform.OS !== 'android') {
         setIsLoading(false);
      }
    }
  }, [checkPermissions]);

  // --- Get FCM Token --- 
  const getFcmToken = React.useCallback(async () => {
    console.log(DEBUG_TAG, 'Getting FCM token...');
    let currentPermission = hasPermission;
    if (currentPermission === null) {
        console.warn(DEBUG_TAG, 'Checking permissions before getting token...');
        currentPermission = await checkPermissions(true);
    }
    
    if (currentPermission === false) {
      const msg = 'Cannot get FCM token without notification permissions.';
      console.error(DEBUG_TAG, msg);
      setError(msg);
      setIsLoading(false);
      return null;
    }

    setError(null);
    try {
      const token = await CustomNotifierModule.getFcmToken();
      console.log(DEBUG_TAG, 'FCM token received:', token);
      setFcmToken(token);
      return token;
    } catch (e: any) {
      const errorMessage = e?.message || 'Error getting FCM token';
      console.error(DEBUG_TAG, 'Error getting FCM token:', e);
      setError(errorMessage);
      setFcmToken(null);
      return null;
    } 
  }, [hasPermission, checkPermissions]);

  // --- Add Listeners --- 
  const addNotificationReceivedListener = React.useCallback((handler: NotificationReceivedHandler): ExpoSubscription | null => {
    console.log(DEBUG_TAG, 'Adding onNotificationReceived listener');
    notificationReceivedListener.current?.remove();
    try {
      notificationReceivedListener.current = CustomNotifierModule.addListener('onNotificationReceived', handler);
      console.log(DEBUG_TAG, 'onNotificationReceived listener added successfully.');
      return notificationReceivedListener.current;
    } catch (e) {
       console.error(DEBUG_TAG, "Failed to add onNotificationReceived listener", e);
       return null;
    }
  }, []);

  const addNotificationOpenedListener = React.useCallback((handler: NotificationOpenedHandler): ExpoSubscription | null => {
    console.log(DEBUG_TAG, 'Adding onNotificationOpened listener');
    notificationOpenedListener.current?.remove();
     try {
      notificationOpenedListener.current = CustomNotifierModule.addListener('onNotificationOpened', handler);
       console.log(DEBUG_TAG, 'onNotificationOpened listener added successfully.');
      return notificationOpenedListener.current;
    } catch (e) {
       console.error(DEBUG_TAG, "Failed to add onNotificationOpened listener", e);
       return null;
    }
  }, []);

  const addTokenRefreshedListener = React.useCallback((handler: TokenRefreshHandler): ExpoSubscription | null => {
    console.log(DEBUG_TAG, 'Adding onTokenRefreshed listener');
    tokenRefreshedListener.current?.remove();
     try {
      tokenRefreshedListener.current = CustomNotifierModule.addListener('onTokenRefreshed', (event: TokenRefreshEvent) => {
          console.log(DEBUG_TAG, 'Token refreshed via listener:', event.token);
          setFcmToken(event.token);
          handler(event);
      });
      console.log(DEBUG_TAG, 'onTokenRefreshed listener added successfully.');
      return tokenRefreshedListener.current;
    } catch (e) {
       console.error(DEBUG_TAG, "Failed to add onTokenRefreshed listener", e);
       return null;
    }
  }, []);

  // --- Initial Setup Effect --- 
  React.useEffect(() => {
    console.log(DEBUG_TAG, 'Initializing notifications hook effect...');
    let isMounted = true;
    setIsLoading(true);

    const initialize = async () => {
        const initialPermission = await checkPermissions();
        if (!isMounted) return;

        if (initialPermission) {
            console.log(DEBUG_TAG, 'Initial permission granted, getting token...');
            await getFcmToken();
        } else {
            console.log(DEBUG_TAG, 'Initial permission not granted.');
        }
         if (isMounted) {
             setIsLoading(false);
         }
    };

    initialize();

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
       if (Platform.OS === 'android' && nextAppState === 'active') {
           console.log(DEBUG_TAG, 'App became active on Android, re-checking permissions...');
           const statusBeforeCall = hasPermission;
           const currentStatus = await checkPermissions();
           if (!isMounted) return;

           setHasPermission(currentStatus);
           setIsLoading(false);
           
           if (currentStatus && !statusBeforeCall && !fcmToken) { 
               console.log(DEBUG_TAG, 'Permission granted after app focus, getting token...');
               await getFcmToken();
           }
       }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      isMounted = false;
      console.log(DEBUG_TAG, 'Cleaning up listeners and AppState subscription');
      notificationReceivedListener.current?.remove();
      notificationOpenedListener.current?.remove();
      tokenRefreshedListener.current?.remove();
      appStateSubscription?.remove();
    };
  }, [checkPermissions, getFcmToken, hasPermission, fcmToken]);

  // --- Returned Hook API --- 
  return {
    hasPermission, 
    fcmToken,      
    isLoading,     
    error,         
    requestPermissions,
    checkPermissions,  
    getFcmToken,       
    addNotificationReceivedListener,
    addNotificationOpenedListener,  
    addTokenRefreshedListener,     
  };
};
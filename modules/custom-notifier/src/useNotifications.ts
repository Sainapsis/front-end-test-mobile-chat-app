import { useCallback, useEffect, useState, useRef } from 'react';
import CustomNotifier from './CustomNotifierModule';
import { NotificationOptions, NotificationEvent } from './CustomNotifier.types';
import { Platform } from 'react-native';

const DEBUG_TAG = '[CustomNotifier]';

type NotificationHandler = (event: NotificationEvent) => void;

// Define a minimal subscription type based on what expo-modules usually returns
interface ExpoSubscription {
  remove: () => void;
}

export const useNotifications = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const notificationReceivedListener = useRef<ExpoSubscription | null>(null);
  const notificationPressedListener = useRef<ExpoSubscription | null>(null);

  useEffect(() => {
    console.log(DEBUG_TAG, 'Initializing notifications hook');
    checkPermissions();

    return () => {
      console.log(DEBUG_TAG, 'Cleaning up listeners');
      notificationReceivedListener.current?.remove();
      notificationPressedListener.current?.remove();
    };
  }, []);

  const checkPermissions = useCallback(async () => {
    try {
      console.log(DEBUG_TAG, 'Checking notification permissions');
      setError(null);
      const granted = await CustomNotifier.checkPermissions();
      console.log(DEBUG_TAG, 'Permission check result:', granted);
      setHasPermission(granted);
      return granted;
    } catch (error: any) {
      const errorMessage = error?.message || 'Error checking permissions';
      console.error(DEBUG_TAG, 'Error checking permissions:', {
        message: errorMessage,
        code: error?.code,
        fullError: error
      });
      setError(errorMessage);
      setHasPermission(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      console.log(DEBUG_TAG, 'Requesting notification permissions');
      setIsLoading(true);
      setError(null);
      const granted = await CustomNotifier.requestPermissions();
      console.log(DEBUG_TAG, 'Permission request result:', granted);
      
      if (Platform.OS === 'android') {
        console.log(DEBUG_TAG, 'Android platform detected, waiting for permission result');
        setTimeout(async () => {
          try {
            console.log(DEBUG_TAG, 'Checking actual permission status after request');
            const actualPermission = await CustomNotifier.checkPermissions();
            console.log(DEBUG_TAG, 'Actual permission status:', actualPermission);
            setHasPermission(actualPermission);
          } catch (error: any) {
            const errorMessage = error?.message || 'Error checking permissions after request';
            console.error(DEBUG_TAG, 'Error in permission check after request:', {
              message: errorMessage,
              code: error?.code,
              fullError: error
            });
            setError(errorMessage);
            setHasPermission(false);
          } finally {
            setIsLoading(false);
          }
        }, 1000);
        return granted;
      }

      setHasPermission(granted);
      return granted;
    } catch (error: any) {
      const errorMessage = error?.message || 'Error requesting permissions';
      console.error(DEBUG_TAG, 'Error requesting permissions:', {
        message: errorMessage,
        code: error?.code,
        fullError: error
      });
      setError(errorMessage);
      setHasPermission(false);
      return false;
    } finally {
      if (Platform.OS !== 'android') {
        setIsLoading(false);
      }
    }
  }, []);

  const showNotification = useCallback(async (options: NotificationOptions) => {
    try {
      console.log(DEBUG_TAG, 'Attempting to show notification:', options);
      setError(null);
      const currentPermission = await checkPermissions();
      console.log(DEBUG_TAG, 'Current permission status:', currentPermission);
      
      if (!currentPermission) {
        console.log(DEBUG_TAG, 'No permission, requesting permissions');
        const granted = await requestPermissions();
        if (!granted) {
          const errorMessage = 'No notification permissions granted';
          console.log(DEBUG_TAG, errorMessage);
          setError(errorMessage);
          return null;
        }
      }

      console.log(DEBUG_TAG, 'Showing notification');
      const notificationId = await CustomNotifier.showNotification(options);
      console.log(DEBUG_TAG, 'Notification shown with ID:', notificationId);
      return notificationId;
    } catch (error: any) {
      const errorMessage = error?.message || 'Error showing notification';
      console.error(DEBUG_TAG, 'Error showing notification:', {
        message: errorMessage,
        code: error?.code,
        fullError: error
      });
      setError(errorMessage);
      return null;
    }
  }, [checkPermissions, requestPermissions]);

  const cancelNotification = useCallback(async (id: string) => {
    try {
      console.log(DEBUG_TAG, 'Cancelling notification:', id);
      setError(null);
      await CustomNotifier.cancelNotification(id);
      console.log(DEBUG_TAG, 'Notification cancelled successfully');
    } catch (error: any) {
      const errorMessage = error?.message || 'Error cancelling notification';
      console.error(DEBUG_TAG, 'Error cancelling notification:', {
        message: errorMessage,
        code: error?.code,
        fullError: error
      });
      setError(errorMessage);
    }
  }, []);

  const cancelAllNotifications = useCallback(async () => {
    try {
      console.log(DEBUG_TAG, 'Cancelling all notifications');
      setError(null);
      await CustomNotifier.cancelAllNotifications();
      console.log(DEBUG_TAG, 'All notifications cancelled successfully');
    } catch (error: any) {
      const errorMessage = error?.message || 'Error cancelling all notifications';
      console.error(DEBUG_TAG, 'Error cancelling all notifications:', {
        message: errorMessage,
        code: error?.code,
        fullError: error
      });
      setError(errorMessage);
    }
  }, []);

  const addNotificationReceivedListener = useCallback((handler: NotificationHandler): ExpoSubscription | null => {
    console.log(DEBUG_TAG, 'Adding onNotificationReceived listener');
    notificationReceivedListener.current?.remove();
    try {
      // Assuming CustomNotifier.addListener conforms to returning { remove(): void }
      notificationReceivedListener.current = CustomNotifier.addListener('onNotificationReceived', handler);
      return notificationReceivedListener.current;
    } catch (e) {
       console.error(DEBUG_TAG, "Failed to add onNotificationReceived listener", e);
       return null;
    }
  }, []);

  const addNotificationPressedListener = useCallback((handler: NotificationHandler): ExpoSubscription | null => {
    console.log(DEBUG_TAG, 'Adding onNotificationPressed listener');
    notificationPressedListener.current?.remove();
     try {
      // Assuming CustomNotifier.addListener conforms to returning { remove(): void }
      notificationPressedListener.current = CustomNotifier.addListener('onNotificationPressed', handler);
      return notificationPressedListener.current;
    } catch (e) {
       console.error(DEBUG_TAG, "Failed to add onNotificationPressed listener", e);
       return null;
    }
  }, []);

  // iOS only: Control foreground notification presentation
  const setShouldShowAlertForForegroundNotifications = useCallback((shouldShow: boolean) => {
    if (Platform.OS === 'ios' && CustomNotifier.setShouldShowAlertForForegroundNotifications) {
      console.log(DEBUG_TAG, 'Setting foreground alert presentation:', shouldShow);
      try {
          CustomNotifier.setShouldShowAlertForForegroundNotifications(shouldShow);
      } catch(e) {
          console.warn(DEBUG_TAG, "Failed to set foreground alert presentation (might be Android)", e)
      }
    }
  }, []);

  return {
    hasPermission,
    isLoading,
    error,
    requestPermissions,
    showNotification,
    cancelNotification,
    cancelAllNotifications,
    checkPermissions,
    addNotificationReceivedListener,
    addNotificationPressedListener,
    setShouldShowAlertForForegroundNotifications,
  };
}; 
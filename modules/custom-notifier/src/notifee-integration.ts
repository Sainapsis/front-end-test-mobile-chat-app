import { Platform } from 'react-native';
import notifee, { AndroidImportance, AndroidChannel } from '@notifee/react-native';
import CustomNotifier from './index';

export async function setupNotifeeBackgroundHandler(): Promise<boolean> {
  try {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return false;
    }

    // Request permissions (iOS)
    if (Platform.OS === 'ios') {
      await notifee.requestPermission();
    }

    // Create default notification channel for Android
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
      
      // Create silent channel for background operations
      await notifee.createChannel({
        id: 'silent',
        name: 'Silent Operations',
        importance: AndroidImportance.LOW,
        sound: 'none',
        vibration: false,
        lights: false,
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up Notifee background handler:', error);
    return false;
  }
}

export async function sendSilentNotification(data: Record<string, any>): Promise<string | undefined> {
  try {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return undefined;
    }
    
    // Create a silent notification
    const channelId = Platform.OS === 'android' ? 'silent' : undefined;
    
    const notificationId = await notifee.displayNotification({
      title: data.title,
      body: data.body,
      data: {
        ...data,
        silent: 'true'
      },
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
        ongoing: false,
        smallIcon: 'ic_notification',
        importance: AndroidImportance.LOW,
        sound: 'none',
        vibrationPattern: [0, 0],
      },
      ios: {
        critical: false,
        sound: undefined,
      }
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error sending silent notification:', error);
    return undefined;
  }
} 
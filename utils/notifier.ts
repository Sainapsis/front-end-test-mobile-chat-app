import notifee, { EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { updateUserInDatabase } from '@/utils/database';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

export async function fetchFCMToken() {
  const token = await messaging().getToken();
  console.log('FCM Token:', token);
  return token;
}

export function setupForegroundMessageHandler(currentUser: any) {
  return messaging().onMessage(async remoteMessage => {
    console.log('onMessage', remoteMessage);
    if (remoteMessage.data && currentUser && currentUser.id) {
      const updatedUser = { id: currentUser.id, modificationDate: new Date().toLocaleString() };
      console.log('User updated:', updatedUser);
      await updateUserInDatabase(updatedUser);
    }
  });
}

export async function setupBackgroundMessageHandler() {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message received:', remoteMessage);
    if (remoteMessage.data) {
      const userId = remoteMessage.data.userId as string;

      console.log('userId', userId);
      console.log('userId', userId);
      console.log('userId', userId);
      console.log('userId', userId);
      console.log('userId', userId);
      console.log('userId', userId);
      console.log('userId', userId);
      if (userId) {
        const updatedUser = { id: userId, modificationDate: new Date().toLocaleString() };
        console.log('User updated in background:', updatedUser);
        await updateUserInDatabase(updatedUser);
      }
    }
  });
}

export async function initializeNotifications(currentUser: any) {
  await requestUserPermission();
  await fetchFCMToken();
  
  const unsubscribe = setupForegroundMessageHandler(currentUser);
  return unsubscribe;
}

export async function onAppBootstrap(currentUser: any) {
  await requestUserPermission();

  const token = await fetchFCMToken();

  console.log('token', token);

  await setupBackgroundMessageHandler();
  
  const unsubscribe = setupForegroundMessageHandler(currentUser);

  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
  }
  
  return unsubscribe;
}

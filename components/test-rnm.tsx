import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from 'custom-notifier';
import { Text, View, Button, StyleSheet, Alert, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { NotificationReceivedEvent, NotificationOpenedEvent, TokenRefreshEvent } from 'custom-notifier/src/CustomNotifier.types';

// Request permissions
// const hasPermission = await CustomNotifier.requestPermissions();

// // Show a notification
// const notificationId = await CustomNotifier.showNotification({
//   title: 'Hello',
//   body: 'This is a test notification',
//   data: { screen: 'home' }
// });

// // Cancel a specific notification
// await CustomNotifier.cancelNotification(notificationId);

// // Cancel all notifications
// await CustomNotifier.cancelAllNotifications();

const DEBUG_TAG = '[TestComponent]';

export default function TestRNM() {
  const {
    isLoading,
    hasPermission,
    fcmToken,
    error,
    requestPermissions,
    checkPermissions,
    getFcmToken,
    addNotificationReceivedListener,
    addNotificationOpenedListener,
    addTokenRefreshedListener,
  } = useNotifications();
  
  const [lastReceived, setLastReceived] = useState<NotificationReceivedEvent | null>(null);
  const [lastOpened, setLastOpened] = useState<NotificationOpenedEvent | null>(null);
  const [lastTokenRefresh, setLastTokenRefresh] = useState<TokenRefreshEvent | null>(null);

  useEffect(() => {
    console.log(DEBUG_TAG, 'Setting up notification listeners...');

    const receivedSubscription = addNotificationReceivedListener((event: NotificationReceivedEvent) => {
      console.log(DEBUG_TAG, 'Notification Received:', JSON.stringify(event, null, 2));
      setLastReceived(event);
      Alert.alert(
        'Notification Received',
        `Title: ${event.notification?.title || 'N/A'}\nBody: ${event.notification?.body || 'N/A'}\nData: ${JSON.stringify(event.data)}`
      );
    });

    const openedSubscription = addNotificationOpenedListener((event: NotificationOpenedEvent) => {
      console.log(DEBUG_TAG, 'Notification Opened:', JSON.stringify(event, null, 2));
      setLastOpened(event);
      Alert.alert(
        'Notification Opened',
        `Title: ${event.notification?.title || 'N/A'}\nBody: ${event.notification?.body || 'N/A'}\nData: ${JSON.stringify(event.data)}`
      );
      if (event.data?.screen) {
        console.log(DEBUG_TAG, `Navigation requested to screen: ${event.data.screen}`);
      }
    });

    const tokenSubscription = addTokenRefreshedListener((event: TokenRefreshEvent) => {
      console.log(DEBUG_TAG, 'Token Refreshed:', event.token);
      setLastTokenRefresh(event);
      Alert.alert('Token Refreshed', `New Token: ${event.token}`);
    });
    
    return () => {
      console.log(DEBUG_TAG, 'Removing notification listeners...');
      receivedSubscription?.remove();
      openedSubscription?.remove();
      tokenSubscription?.remove();
    };
  }, [addNotificationReceivedListener, addNotificationOpenedListener, addTokenRefreshedListener]);

  const handleRequestPermission = async () => {
    console.log(DEBUG_TAG, 'handleRequestPermission pressed');
    await requestPermissions();
  }

  const handleGetToken = async () => {
    console.log(DEBUG_TAG, 'handleGetToken pressed');
    await getFcmToken();
  }

  if (isLoading && hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Initializing Notifications...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Custom Notifier (FCM)</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Permission Status:</Text>
        <Text style={[styles.statusValue, hasPermission === true ? styles.granted : (hasPermission === false ? styles.denied : styles.unknown)]}>
          {hasPermission === true ? 'Granted' : (hasPermission === false ? 'Denied' : 'Unknown')}
        </Text>
        {error && (
          <Text style={styles.errorText}>Error: {error}</Text>
        )}
      </View>

      <View style={styles.tokenContainer}>
         <Text style={styles.tokenLabel}>FCM Token:</Text>
         <Text selectable style={styles.tokenValue}>{fcmToken || 'N/A'}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Request Permissions"
          onPress={handleRequestPermission}
          disabled={hasPermission === true || isLoading} 
        />
        <View style={styles.buttonSpacing} />
        <Button
          title="Get/Refresh FCM Token"
          onPress={handleGetToken}
          disabled={hasPermission !== true || isLoading}
        />
      </View>

      <View style={styles.eventLogContainer}>
         <Text style={styles.logTitle}>Last Events:</Text>
         <View style={styles.eventDetail}>
            <Text style={styles.eventLabel}>Received:</Text>
            <Text style={styles.eventData}>{lastReceived ? JSON.stringify(lastReceived.data) : 'None'}</Text>
         </View>
         <View style={styles.eventDetail}>
            <Text style={styles.eventLabel}>Opened:</Text>
            <Text style={styles.eventData}>{lastOpened ? JSON.stringify(lastOpened.data) : 'None'}</Text>
         </View>
         <View style={styles.eventDetail}>
            <Text style={styles.eventLabel}>Token Refresh:</Text>
            <Text style={styles.eventData}>{lastTokenRefresh ? `...${lastTokenRefresh.token.slice(-10)}` : 'None'}</Text>
         </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
      padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#343a40',
  },
  statusContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#495057',
  },
  statusValue: {
      fontSize: 16,
      textAlign: 'center',
      fontWeight: 'bold',
  },
  granted: { color: '#28a745' },
  denied: { color: '#dc3545' },
  unknown: { color: '#6c757d' },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#dc3545',
    textAlign: 'center',
  },
   tokenContainer: {
     marginBottom: 20,
     padding: 15,
     borderRadius: 8,
     backgroundColor: '#fff',
     borderWidth: 1,
     borderColor: '#ced4da',
  },
  tokenLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 5,
      color: '#495057',
  },
  tokenValue: {
      fontSize: 12,
      fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
      color: '#007bff',
      flexWrap: 'wrap',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  buttonSpacing: {
    height: 15,
  },
  loadingText: {
      marginTop: 15,
      fontSize: 16,
      color: '#6c757d',
  },
  eventLogContainer: {
      marginTop: 10,
      padding: 15,
      borderRadius: 8,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ced4da',
  },
  logTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#343a40',
  },
  eventDetail: {
      marginBottom: 8,
  },
  eventLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#495057',
      marginBottom: 3,
  },
  eventData: {
      fontSize: 12,
      color: '#6c757d',
      fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
});


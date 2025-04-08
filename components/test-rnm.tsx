import React, { useState, useEffect } from 'react';
import CustomNotifier, { useNotifications} from 'custom-notifier';
import { Text, View, Button, StyleSheet, Alert, Platform } from 'react-native';
import { NotificationEvent } from 'custom-notifier/src/CustomNotifier.types';

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

export default function TestRNM() {
  const {
    isLoading,
    hasPermission,
    error,
    requestPermissions,
    showNotification,
    cancelNotification,
    cancelAllNotifications,
    addNotificationReceivedListener,
    addNotificationPressedListener,
    setShouldShowAlertForForegroundNotifications,
  } = useNotifications();
  
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [foregroundAlerts, setForegroundAlerts] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      setShouldShowAlertForForegroundNotifications(foregroundAlerts);
    }

    const receivedSubscription = addNotificationReceivedListener((event: NotificationEvent) => {
      console.log('[Example] Notification Received:', event);
      Alert.alert(
        'Notification Received',
        `ID: ${event.notificationId}\nAction: ${event.action}\nData: ${JSON.stringify(event.data)}`
      );
    });

    const pressedSubscription = addNotificationPressedListener((event: NotificationEvent) => {
      console.log('[Example] Notification Pressed:', event);
      Alert.alert(
        'Notification Pressed',
        `ID: ${event.notificationId}\nAction: ${event.action}\nData: ${JSON.stringify(event.data)}`
      );
      if (event.data?.screen) {
        console.log(`Navigate to screen: ${event.data.screen}`)
      }
    });
    
    return () => {
      receivedSubscription?.remove();
      pressedSubscription?.remove();
    };
  }, [addNotificationReceivedListener, addNotificationPressedListener, setShouldShowAlertForForegroundNotifications, foregroundAlerts]);

  const handleValidateNotification = async () => {
    try {
      const granted = await requestPermissions();
      console.log('Permission granted:', granted);
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  }

  const handleShowNotification = async (isSilent: boolean = false) => {
    try {
      const newNotificationId = await showNotification({
        title: isSilent ? 'Silent Data Update' : 'Test Notification',
        body: isSilent ? 'Processing in background...' : 'Press me to see data!',
        data: { 
          screen: isSilent ? 'backgroundTask' : 'details', 
          itemId: Date.now(),
          sentSilent: isSilent
        },
        isSilent: isSilent
      });
      
      if (newNotificationId) {
        console.log(`Notification ${isSilent ? 'silent' : 'normal'} shown with ID:`, newNotificationId);
        if (!isSilent) {
          setNotificationId(newNotificationId);
        }
      }
    } catch (error) {
      console.error(`Error showing ${isSilent ? 'silent' : 'normal'} notification:`, error);
    }
  }

  const handleCancelNotification = async () => {
    try {
      if (notificationId) {
        await cancelNotification(notificationId);
        setNotificationId(null);
      }
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  const handleCancelAllNotifications = async () => {
    try {
      await cancelAllNotifications();
      setNotificationId(null);
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  const toggleForegroundAlert = () => {
    if (Platform.OS === 'ios') {
      const newValue = !foregroundAlerts;
      setForegroundAlerts(newValue);
      setShouldShowAlertForForegroundNotifications(newValue);
      Alert.alert('Foreground Alert Setting (iOS)', `Will ${newValue ? 'show' : 'hide'} alerts for foreground notifications.`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, error ? { marginBottom: 10 } : null]}>
          Permission Status: {hasPermission ? 'Granted' : 'Not Granted'}
        </Text>
        {error && (
          <Text style={styles.errorText}>
            Error: {error}
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Request Permissions"
          onPress={handleValidateNotification}
          disabled={hasPermission === true}
        />
        <View style={styles.buttonSpacing} />
        <Button
          title="Show Normal Notification"
          onPress={() => handleShowNotification(false)}
          disabled={hasPermission !== true}
        />
        <View style={styles.buttonSpacing} />
        <Button
          title="Show Silent Notification (Data Only)"
          onPress={() => handleShowNotification(true)}
          disabled={hasPermission !== true}
        />
        <View style={styles.buttonSpacing} />
        <Button
          title="Cancel Last Visible Notification"
          onPress={handleCancelNotification}
          disabled={!notificationId}
        />
        <View style={styles.buttonSpacing} />
        <Button
          title="Cancel All Notifications"
          onPress={handleCancelAllNotifications}
          disabled={hasPermission !== true}
        />
         {Platform.OS === 'ios' && (
          <>
            <View style={styles.buttonSpacing} />
            <Button
              title={`Foreground Alert: ${foregroundAlerts ? 'ON' : 'OFF'} (iOS)`}
              onPress={toggleForegroundAlert}
              disabled={hasPermission !== true}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  statusContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  buttonSpacing: {
    height: 10,
  },
});


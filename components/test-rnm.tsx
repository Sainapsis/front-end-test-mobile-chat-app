import CustomNotifier, { useNotifications} from 'custom-notifier';
import { useState } from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';

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
  const { isLoading, hasPermission, error, requestPermissions, showNotification, cancelNotification, cancelAllNotifications, checkPermissions } = useNotifications();
  const [notificationId, setNotificationId] = useState<string | null>(null);

  const handleValidateNotification = async () => {
    try {
      const granted = await requestPermissions();
      const permission = await checkPermissions();
      console.log('Permission granted:', granted);
      console.log('Permission:', permission);
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  }

  const handleShowNotification = async () => {
    try {
      const notificationId = await showNotification({
        title: 'Test Notification',
        body: 'This is a test notification',
        data: { screen: 'home' }
      });
      
      if (notificationId) {
        console.log('Notification shown with ID:', notificationId);
        setNotificationId(notificationId);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
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
          title="Show Notification"
          onPress={handleShowNotification}
          disabled={hasPermission !== true}
        />
        <View style={styles.buttonSpacing} />
        <Button
          title="Cancel Last Notification"
          onPress={handleCancelNotification}
          disabled={!notificationId}
        />
        <View style={styles.buttonSpacing} />
        <Button
          title="Cancel All Notifications"
          onPress={handleCancelAllNotifications}
          disabled={hasPermission !== true}
        />
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

